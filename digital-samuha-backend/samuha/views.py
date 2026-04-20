from django.db import transaction, models
from rest_framework import permissions, status, viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from .serializers import SamuhaRegisterSerializer, ExitRequestSerializer
from .models import Membership, Samuha, ExitRequest
from notifications.utils import send_approval_email, notify_user
from attendance.meeting_service import get_or_create_scheduled_meeting
from ledger.settlement_service import calculate_final_settlement
from ledger.models import Transaction


class SamuhaRegisterView(APIView):
    """
    Register a Samuha and create the Adhakshya user account.
    This is the FIRST step - no authentication required.
    The adhakshya who registers becomes the creator and gets admin access.
    Expects multipart/form-data if proof_document is included.
    """

    permission_classes = [permissions.AllowAny]  # No auth required - this is step 1
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = SamuhaRegisterSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        samuha = serializer.save()
        return Response(SamuhaRegisterSerializer(samuha).data, status=status.HTTP_201_CREATED)


class SamuhaMembersView(APIView):
    """List approved members of the authenticated user's Samuha."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status')
        
        # Get user's primary membership
        # Adhakshya/Co-Adhakshya can see all members. Members can only see approved ones.
        user_membership = Membership.objects.filter(user=request.user).first()
        if not user_membership:
            return Response({"detail": "No membership found."}, status=status.HTTP_403_FORBIDDEN)
        
        # Define base query
        query = Membership.objects.filter(samuha=user_membership.samuha).select_related('user')
        
        # If not adhakshya/co-adhakshya, only show active members
        if user_membership.role not in [Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA]:
            query = query.filter(status=Membership.STATUS_ACTIVE)
        elif status_filter:
            query = query.filter(status=status_filter)
        
        members = query.order_by('-joined_at')
        
        return Response([{
            "id": m.user.id,
            "membership_id": m.id,
            "full_name": f"{m.user.first_name} {m.user.last_name}".strip() or m.user.phone,
            "phone": m.user.phone,
            "email": m.user.email,
            "role": m.role,
            "role_display": m.get_role_display(),
            "status": m.status,
            "status_display": m.get_status_display(),
            "joined_at": m.joined_at.isoformat(),
            # NEW: Verification Fields
            "citizenship_no": m.citizenship_no,
            "citizenship_front": request.build_absolute_uri(m.citizenship_front.url) if m.citizenship_front else None,
            "citizenship_back": request.build_absolute_uri(m.citizenship_back.url) if m.citizenship_back else None,
        } for m in members])


class PendingSamuhaListView(APIView):
    """
    List all Samuha registrations with 'pending' status.
    Accessible only by super admins.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        if not request.user.is_superuser:
            return Response({"detail": "Only super admins can access this."}, status=status.HTTP_403_FORBIDDEN)
        
        pending_samuhas = Samuha.objects.filter(status=Samuha.STATUS_PENDING).order_by('-created_at')
        serializer = SamuhaRegisterSerializer(pending_samuhas, many=True)
        return Response(serializer.data)


class ApproveSamuhaView(APIView):
    """
    Approve a pending Samuha registration.
    Accessible only by super admins.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request, pk):
        if not request.user.is_superuser:
            return Response({"detail": "Only super admins can access this."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            samuha = Samuha.objects.get(pk=pk, status=Samuha.STATUS_PENDING)
            
            # 1. Update Samuha status
            samuha.status = Samuha.STATUS_ACTIVE
            samuha.save()
            
            # 2. Approve the Adhakshya membership if it exists
            adhakshya_membership = Membership.objects.filter(
                samuha=samuha, 
                role=Membership.ROLE_ADHAKSHYA
            ).first()
            
            if adhakshya_membership:
                adhakshya_membership.is_approved = True
                adhakshya_membership.status = Membership.STATUS_ACTIVE
                adhakshya_membership.save()
            
            # 3. Send notification email
            send_approval_email(samuha)
            
            return Response({
                "detail": f"Samuha '{samuha.samuha_name}' approved successfully and notification sent.",
                "samuha_code": samuha.samuha_code
            })
            
        except Samuha.DoesNotExist:
            return Response({"detail": "Pending Samuha not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Capture and return the real error
            return Response({"detail": f"Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SamuhaListView(APIView):
    """
    List all Samuhas (active or inactive).
    Accessible only by super admins.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        if not request.user.is_superuser:
            return Response({"detail": "Only super admins can access this."}, status=status.HTTP_403_FORBIDDEN)
        
        # We can exclude 'pending' if we want a separate management view, 
        # but showing all non-pending ones is usually what's requested for "management".
        samuhas = Samuha.objects.exclude(status=Samuha.STATUS_PENDING).order_by('-created_at')
        serializer = SamuhaRegisterSerializer(samuhas, many=True)
        return Response(serializer.data)


class UpdateSamuhaStatusView(APIView):
    """
    Update the status of a Samuha (active/inactive).
    Accessible only by super admins.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def patch(self, request, pk):
        if not request.user.is_superuser:
            return Response({"detail": "Only super admins can access this."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            samuha = Samuha.objects.get(pk=pk)
            new_status = request.data.get('status')
            
            if new_status not in [Samuha.STATUS_ACTIVE, Samuha.STATUS_INACTIVE]:
                return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
            
            samuha.status = new_status
            samuha.save()
            
            return Response({
                "detail": f"Samuha '{samuha.samuha_name}' status updated to {new_status}.",
                "status": new_status
            })
            
        except Samuha.DoesNotExist:
            return Response({"detail": "Samuha not found."}, status=status.HTTP_404_NOT_FOUND)


class UpdateMemberStatusView(APIView):
    """
    Update a member's status (Approve, Deactivate, Reject).
    Accessible by Adhakshya or Co-Adhakshya of the Samuha.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            # Target membership
            target_membership = Membership.objects.get(pk=pk)
            
            # Requesting user's membership in the same samuha
            requester_membership = Membership.objects.filter(
                user=request.user, 
                samuha=target_membership.samuha
            ).first()
            
            # Check permissions
            if not requester_membership or requester_membership.role not in [
                Membership.ROLE_ADHAKSHYA, 
                Membership.ROLE_CO_ADHAKSHYA
            ]:
                return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
            
            # Leadership Shield: Adhakshya status cannot be changed to REJECTED or INACTIVE
            if target_membership.role == Membership.ROLE_ADHAKSHYA:
                if new_status in [Membership.STATUS_REJECTED, Membership.STATUS_INACTIVE]:
                    return Response(
                        {"detail": "The founding Adhakshya cannot be rejected or deactivated. They are the supreme authority of this Samuha."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                # Others cannot even approve/reactivate Adhakshya (redundant since they are auto-active, but safe)
                if request.user.id != target_membership.user.id:
                    return Response({"detail": "Only the Adhakshya can manage their own status (within limits)."}, status=status.HTTP_400_BAD_REQUEST)

            new_status = request.data.get('status')
            if new_status not in [choice[0] for choice in Membership.STATUS_CHOICES]:
                return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
            
            target_membership.status = new_status
            target_membership.is_approved = (new_status == Membership.STATUS_ACTIVE)
            target_membership.save()
            
            # Notify the member
            from notifications.utils import notify_user
            status_labels = {
                Membership.STATUS_ACTIVE: "Approved ✅",
                Membership.STATUS_INACTIVE: "Deactivated 🔒",
                Membership.STATUS_REJECTED: "Rejected ❌",
                Membership.STATUS_PENDING: "Pending ⏳"
            }
            label = status_labels.get(new_status, new_status)
            notify_user(
                user=target_membership.user,
                title=f"Membership Status Update: {label}",
                message=f"Your membership status in {target_membership.samuha.samuha_name} has been updated to {new_status}.",
                link="/profile",
                type='other'
            )
            
            return Response({
                "detail": f"Member {target_membership.user.phone} status updated to {new_status}.",
                "status": new_status
            })
            
        except Membership.DoesNotExist:
            return Response({"detail": "Membership not found."}, status=status.HTTP_404_NOT_FOUND)


class UpdateMemberRoleView(APIView):
    """
    Update a member's role (Promote/Demote).
    Only the Adhakshya can promote to Co-Adhakshya or demote to Member.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            target_membership = Membership.objects.get(pk=pk)
            samuha = target_membership.samuha
            
            # 1. Permission Check: Only the active Adhakshya can manage roles
            requester_membership = Membership.objects.filter(
                user=request.user, 
                samuha=samuha,
                role=Membership.ROLE_ADHAKSHYA,
                status=Membership.STATUS_ACTIVE
            ).first()
            
            if not requester_membership:
                return Response({"detail": "Only the Adhakshya can manage member roles."}, status=status.HTTP_403_FORBIDDEN)
            
            # 2. Protection: Adhakshya cannot demote themselves here (must use TransferLeadership)
            if target_membership.user.id == request.user.id:
                 return Response({"detail": "You cannot demote yourself. Use the 'Transfer Leadership' feature to step down safely."}, status=status.HTTP_400_BAD_REQUEST)

            new_role = request.data.get('role')
            if new_role not in [Membership.ROLE_CO_ADHAKSHYA, Membership.ROLE_MEMBER]:
                return Response({"detail": "Invalid role specified."}, status=status.HTTP_400_BAD_REQUEST)

            # 3. Rule Check: Only ONE Co-Adhakshya allowed
            if new_role == Membership.ROLE_CO_ADHAKSHYA:
                exists = Membership.objects.filter(
                    samuha=samuha, 
                    role=Membership.ROLE_CO_ADHAKSHYA,
                    status=Membership.STATUS_ACTIVE
                ).exclude(id=target_membership.id).exists()
                
                if exists:
                    return Response({"detail": "There can not be 2 co adhakshya in a samuha"}, status=status.HTTP_400_BAD_REQUEST)

            # 4. Perform Update
            old_role = target_membership.role
            target_membership.role = new_role
            target_membership.save()
            
            # 5. Notify
            notify_user(
                user=target_membership.user,
                title="Leadership Update",
                message=f"Your role in {samuha.samuha_name} has been updated from {old_role} to {new_role}.",
                type='other'
            )
            
            return Response({
                "detail": f"Role updated to {new_role}.",
                "role": new_role
            })

        except Membership.DoesNotExist:
            return Response({"detail": "Membership not found."}, status=status.HTTP_404_NOT_FOUND)


class TransferLeadershipView(APIView):
    """
    Swap the Adhakshya role with another member.
    The current Adhakshya becomes a regular member (or switches roles with successor),
    and the successor becomes the new Adhakshya.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            successor_id = request.data.get('successor_id') # This is the Membership PK
            if not successor_id:
                return Response({"detail": "Successor selection is required."}, status=status.HTTP_400_BAD_REQUEST)

            # 1. Identify roles
            current_adh_mem = Membership.objects.filter(
                user=request.user, 
                role=Membership.ROLE_ADHAKSHYA,
                status=Membership.STATUS_ACTIVE
            ).first()
            
            if not current_adh_mem:
                return Response({"detail": "Only the current Adhakshya can initiate a leadership transfer."}, status=status.HTTP_403_FORBIDDEN)

            successor_mem = Membership.objects.get(pk=successor_id, samuha=current_adh_mem.samuha)
            
            if successor_mem.status != Membership.STATUS_ACTIVE:
                return Response({"detail": "The successor must be an active member."}, status=status.HTTP_400_BAD_REQUEST)

            if successor_mem.id == current_adh_mem.id:
                return Response({"detail": "You are already the Adhakshya."}, status=status.HTTP_400_BAD_REQUEST)

            samuha = current_adh_mem.samuha
            successor_old_role = successor_mem.role

            # 2. Transactional Swap
            with transaction.atomic():
                # A. Update successor details if provided (mandatory if missing)
                new_email = request.data.get('email')
                new_cit_no = request.data.get('citizenship_no')
                
                if new_email:
                    successor_mem.user.email = new_email
                    successor_mem.user.save()
                
                if new_cit_no:
                    successor_mem.citizenship_no = new_cit_no
                    successor_mem.save()

                # B. Demote current leader
                # If swapping with Co-Adhakshya, current leader becomes Co-Adhakshya
                # If swapping with Member, current leader becomes Member
                current_adh_mem.role = successor_old_role
                current_adh_mem.save()

                # C. Promote successor
                successor_mem.role = Membership.ROLE_ADHAKSHYA
                successor_mem.save()

                # D. Sync Official Samuha Profile
                new_adhakshya_user = successor_mem.user
                samuha.adhakshya_full_name = new_adhakshya_user.full_name
                samuha.adhakshya_phone = new_adhakshya_user.phone
                samuha.adhakshya_email = new_adhakshya_user.email or ""
                samuha.adhakshya_citizenship_no = successor_mem.citizenship_no or ""
                samuha.save()

            # 3. Mass Notify
            all_members = Membership.objects.filter(samuha=samuha, status=Membership.STATUS_ACTIVE)
            for m in all_members:
                notify_user(
                    m.user,
                    "Leadership Change 👑",
                    f"{new_adhakshya_user.full_name} is now the official Adhakshya of {samuha.samuha_name}."
                )

            return Response({
                "detail": f"Leadership successfully transferred to {new_adhakshya_user.full_name}.",
                "new_role": current_adh_mem.role
            })

        except Membership.DoesNotExist:
            return Response({"detail": "Successor membership not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SamuhaSettingsView(APIView):
    """
    Get or Update Samuha rules (Meeting day, Fines, etc.)
    GET: Accessible by all active members.
    PATCH: Accessible only by Adhakshya.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_user_samuha(self, user):
        # Find ANY active membership for the user
        membership = Membership.objects.filter(
            user=user, 
            status=Membership.STATUS_ACTIVE
        ).first()
        if not membership:
            return None
        return membership.samuha

    def get(self, request):
        samuha = self.get_user_samuha(request.user)
        if not samuha:
             return Response({"detail": "You are not an active member of any Samuha."}, status=status.HTTP_403_FORBIDDEN)
        
        # Trigger auto-creation of meeting if today is a scheduled day
        get_or_create_scheduled_meeting(samuha)
        
        from .serializers import SamuhaSettingsSerializer
        serializer = SamuhaSettingsSerializer(samuha)
        return Response(serializer.data)

    def patch(self, request):
        # Update restricted to Adhakshya only
        membership = Membership.objects.filter(
            user=request.user, 
            role=Membership.ROLE_ADHAKSHYA,
            status=Membership.STATUS_ACTIVE
        ).first()
        
        if not membership:
             return Response({"detail": "Only an active Adhakshya can update settings."}, status=status.HTTP_403_FORBIDDEN)
        
        samuha = membership.samuha
        from .serializers import SamuhaSettingsSerializer
        serializer = SamuhaSettingsSerializer(samuha, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SamuhaDetailsView(APIView):
    """
    Get detailed information about the current Samuha.
    Frontend needs this for the Dashboard/Documents view.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        membership = Membership.objects.filter(user=request.user, status=Membership.STATUS_ACTIVE).first()
        if not membership:
             return Response({"detail": "Active membership not found."}, status=status.HTTP_404_NOT_FOUND)
        
        samuha = membership.samuha
        return Response({
            "id": samuha.id,
            "samuha_name": samuha.samuha_name,
            "samuha_code": samuha.samuha_code,
            "is_premium": samuha.is_premium,
            "status": samuha.status,
            "adhakshya_full_name": samuha.adhakshya_full_name,
            "adhakshya_phone": samuha.adhakshya_phone,
            "province": samuha.province,
            "district": samuha.district,
            "municipality": samuha.municipality,
            "ward_number": samuha.ward_number,
            "created_at": samuha.created_at,
            "member_count": samuha.memberships.filter(status=Membership.STATUS_ACTIVE).count(),
            # Add other fields as needed by frontend
        })


class CheckSamuhaCodeView(APIView):
    """
    Check if a Samuha code is valid and return auto-fill data for Adhakshya.
    Accessible by anyone during the Signup process.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        role = request.query_params.get('role')

        if not code or not role:
            return Response({"error": "Code and Role are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Look for the Samuha by code
            samuha = Samuha.objects.get(samuha_code=code)
            
            # Basic existence check
            data = {
                "exists": True,
                "samuha_name": samuha.samuha_name,
                "status": samuha.status,
            }

            # If the user selects Adhakshya, we check if one already exists for this group
            if role == Membership.ROLE_ADHAKSHYA:
                # Check if an ACTIVE Adhakshya already exists (not just registered, but signed up)
                active_adhakshya = Membership.objects.filter(
                    samuha=samuha, 
                    role=Membership.ROLE_ADHAKSHYA,
                    status=Membership.STATUS_ACTIVE
                ).exists()

                if not active_adhakshya:
                    # Return the data from the Samuha registration for auto-fill
                    full_name = samuha.adhakshya_full_name
                    name_parts = full_name.strip().split(' ')
                    
                    data.update({
                        "first_name": name_parts[0] if len(name_parts) > 0 else "",
                        "last_name": " ".join(name_parts[1:]) if len(name_parts) > 1 else "",
                        "phone": samuha.adhakshya_phone,
                        "email": samuha.adhakshya_email,
                        "citizenship_no": samuha.adhakshya_citizenship_no,
                    })

            # NEW: Check if Co-Adhakshya already exists
            elif role == Membership.ROLE_CO_ADHAKSHYA:
                active_co_adhakshya = Membership.objects.filter(
                    samuha=samuha, 
                    role=Membership.ROLE_CO_ADHAKSHYA,
                    status=Membership.STATUS_ACTIVE
                ).exists()
                if active_co_adhakshya:
                    data.update({
                        "role_taken": True,
                        "error": "This Samuha already has an active Co-Adhakshya."
                    })

            return Response(data)

        except Samuha.DoesNotExist:
            return Response({
                "exists": False, 
                "error": "Invalid Samuha Code. Please check with your group admin."
            }, status=status.HTTP_404_NOT_FOUND)


class ExitPreviewView(APIView):
    """
    Get a preview of the final settlement for a member.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        # 1. Permission Check
        target_membership = Membership.objects.filter(pk=pk).first()
        if not target_membership:
            return Response({"detail": "Membership not found."}, status=status.HTTP_404_NOT_FOUND)
        
        user_membership = Membership.objects.filter(user=request.user, samuha=target_membership.samuha).first()
        if not user_membership or user_membership.role not in [Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA]:
            # Members can only preview their own settlement
            if target_membership.user != request.user:
                return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        # 2. Calculate
        try:
            settlement = calculate_final_settlement(target_membership.user, target_membership.samuha)
            return Response(settlement)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ExitRequestViewSet(viewsets.ModelViewSet):
    """
    Handles member exit requests.
    """
    serializer_class = ExitRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_membership = Membership.objects.filter(user=self.request.user).first()
        if not user_membership:
            return ExitRequest.objects.none()
        
        if user_membership.role in [Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA]:
            return ExitRequest.objects.filter(samuha=user_membership.samuha)
        
        return ExitRequest.objects.filter(user=self.request.user, samuha=user_membership.samuha)

    def perform_create(self, serializer):
        # 1. Find user's membership
        membership = Membership.objects.filter(user=self.request.user).first()
        if not membership:
            raise ValidationError("You have no active membership to leave.")
            
        # 2. Loan Guard: Check for active loans via settlement service
        try:
            calculate_final_settlement(self.request.user, membership.samuha)
        except Exception as e:
            # Map DRF ValidationError correctly
            if hasattr(e, 'detail'):
                 raise e
            raise ValidationError(str(e))

        # 3. Save request
        serializer.save(user=self.request.user, samuha=membership.samuha)
        
        # Notify admins
        admins = Membership.objects.filter(
            samuha=membership.samuha, 
            role__in=[Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA],
            status=Membership.STATUS_ACTIVE
        )
        for admin in admins:
            notify_user(
                admin.user, 
                "New Exit Request 🚪", 
                f"{self.request.user.full_name} has requested to leave the Samuha."
            )

    def partial_update(self, request, *args, **kwargs):
        """
        Approve or Reject the request.
        """
        instance = self.get_object()
        new_status = request.data.get('status')
        
        if instance.status != ExitRequest.STATUS_PENDING:
            return Response({"detail": "This request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

        # Only admins can approve/reject
        user_membership = Membership.objects.filter(user=request.user, samuha=instance.samuha).first()
        if not user_membership or user_membership.role not in [Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA]:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        if new_status == ExitRequest.STATUS_APPROVED:
            # 1. Calculate final settlement
            settlement = calculate_final_settlement(instance.user, instance.samuha)
            
            # 2. Record Exit Payout in Ledger
            amount = settlement['net_payout']
            if amount > 0:
                Transaction.objects.create(
                    samuha=instance.samuha,
                    user=instance.user,
                    type=Transaction.TYPE_EXPENSE,
                    amount=amount,
                    description=f"Member Exit Payout: {instance.user.full_name}"
                )
            
            # 3. Update Membership & Scrub Sensitive Data
            Membership.objects.filter(user=instance.user, samuha=instance.samuha).update(
                citizenship_no=None,             # SCRUB: Personal data removed
                citizenship_front=None,
                citizenship_back=None,
                status=Membership.STATUS_EXITED,
                is_approved=False
            )

            # 4. Lockdown User Account (if no other active groups)
            other_active_groups = Membership.objects.filter(
                user=instance.user, 
                status=Membership.STATUS_ACTIVE
            ).exclude(samuha=instance.samuha).exists()

            if not other_active_groups:
                user = instance.user
                user.is_active = False
                user.save()
            
            # 4. Finalize Request
            instance.status = ExitRequest.STATUS_APPROVED
            instance.settlement_amount = amount
            from django.utils import timezone
            instance.processed_at = timezone.now()
            instance.processed_by = request.user
            instance.save()
            
            notify_user(instance.user, "Exit Request Approved", f"Your request to leave {instance.samuha.samuha_name} has been approved. Payout of NPR {amount} recorded. Your account has been deactivated.")
            return Response(ExitRequestSerializer(instance).data)
            
        elif new_status == ExitRequest.STATUS_REJECTED:
            instance.status = ExitRequest.STATUS_REJECTED
            instance.save()
            notify_user(instance.user, "Exit Request Rejected", f"Your request to leave {instance.samuha.samuha_name} was rejected by the admin.")
            return Response(ExitRequestSerializer(instance).data)

        return super().partial_update(request, *args, **kwargs)

