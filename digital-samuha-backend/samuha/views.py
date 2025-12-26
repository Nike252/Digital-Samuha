from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import SamuhaRegisterSerializer
from .models import Membership, Samuha
from notifications.utils import send_approval_email
from attendance.meeting_service import get_or_create_scheduled_meeting


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
            
            # Prevent self-demotion/deactivation if Adhakshya? 
            # (Optional security logic: Adhakshya cannot be deactivated by anyone except SuperAdmin?)
            if target_membership.role == Membership.ROLE_ADHAKSHYA and request.user.id != target_membership.user.id:
                return Response({"detail": "Cannot change Adhakshya status."}, status=status.HTTP_400_BAD_REQUEST)

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
                    })

            return Response(data)

        except Samuha.DoesNotExist:
            return Response({
                "exists": False, 
                "error": "Invalid Samuha Code. Please check with your group admin."
            }, status=status.HTTP_404_NOT_FOUND)

