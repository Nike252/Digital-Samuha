from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from .models import Plan, SamuhaSubscription
from .serializers import SamuhaSubscriptionSerializer, PlanSerializer
from ledger.payment_utils import verify_khalti_payment, generate_esewa_signature, verify_esewa_payment
from samuha.models import Membership
from attendance.models import Meeting, Attendance
from attendance.meeting_service import get_or_create_scheduled_meeting
import uuid

class SubscriptionStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Find any active membership for this user to get their Samuha
        membership = Membership.objects.filter(
            user=request.user, 
            status=Membership.STATUS_ACTIVE
        ).first()
        
        if not membership:
            return Response({"detail": "You do not belong to any Samuha."}, status=status.HTTP_404_NOT_FOUND)
        
        sub, created = SamuhaSubscription.objects.get_or_create(
            samuha=membership.samuha,
            defaults={'plan': Plan.objects.get(name='basic')}
        )
        
        serializer = SamuhaSubscriptionSerializer(sub)
        return Response(serializer.data)

class UpgradeSubscriptionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        token = request.data.get('token') # Khalti token
        
        plan = get_object_or_404(Plan, id=plan_id)
        
        membership = Membership.objects.filter(
            user=request.user, 
            role=Membership.ROLE_ADHAKSHYA, 
            status=Membership.STATUS_ACTIVE
        ).first()
        
        if not membership:
            return Response({"detail": "Only Samuha Adhakshya can upgrade subscriptions."}, status=status.HTTP_403_FORBIDDEN)
            
        # Verify payment with Khalti
        # amount in paisa
        success, data = verify_khalti_payment(token, int(plan.price * 100))
        
        if success:
            sub, created = SamuhaSubscription.objects.get_or_create(samuha=membership.samuha)
            sub.plan = plan
            sub.start_date = timezone.now()
            sub.expiry_date = timezone.now() + timedelta(days=365) # 1 year subscription
            sub.is_active = True
            sub.save()
            
            return Response({
                "detail": f"Successfully upgraded to {plan.get_name_display()}!",
                "subscription": SamuhaSubscriptionSerializer(sub).data
            })
            
        return Response({
            "detail": "Payment verification failed.",
            "error": data
        }, status=status.HTTP_400_BAD_REQUEST)

class PlanListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        plans = Plan.objects.all()
        return Response(PlanSerializer(plans, many=True).data)

class eSewaInitiateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        plan = get_object_or_404(Plan, id=plan_id)
        
        # Generate unique transaction ID
        transaction_uuid = f"UP-{uuid.uuid4().hex[:8]}" # UP for Upgrade
        
        signature, total_amount = generate_esewa_signature(plan.price, transaction_uuid)
        
        origin = request.META.get('HTTP_ORIGIN', 'http://localhost:5173')
        
        return Response({
            "signature": signature,
            "transaction_uuid": transaction_uuid,
            "total_amount": total_amount,
            "product_code": "EPAYTEST",
            "success_url": f"{origin}/payment-success",
            "failure_url": f"{origin}/settings",
        })

class eSewaVerifyView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            encoded_data = request.data.get('data')
            success, res_data = verify_esewa_payment(encoded_data)
            
            if success:
                tx_uuid = res_data.get('transaction_uuid', '')
                
                # CASE 1: Platform Upgrade
                if tx_uuid.startswith('UP-'):
                    try:
                        plan = Plan.objects.get(name='premium')
                    except Plan.DoesNotExist:
                        return Response({"detail": "Configuration error: Premium plan not found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                    membership = Membership.objects.filter(
                        user=request.user, 
                        role=Membership.ROLE_ADHAKSHYA, 
                        status=Membership.STATUS_ACTIVE
                    ).first()
                    
                    if not membership:
                        return Response({"detail": "Adhakshya membership not found for current user."}, status=status.HTTP_404_NOT_FOUND)
                        
                    sub, _ = SamuhaSubscription.objects.get_or_create(samuha=membership.samuha)
                    sub.plan = plan
                    sub.is_active = True
                    sub.start_date = timezone.now()
                    sub.expiry_date = timezone.now() + timedelta(days=365)
                    sub.save()
                    return Response({"detail": "Upgrade successful.", "type": "upgrade"})

                # CASE 2: Meeting Saving Deposit
                elif tx_uuid.startswith('SV-'):
                    from ledger.models import Transaction
                    from attendance.models import Meeting
                    membership = Membership.objects.filter(user=request.user, status=Membership.STATUS_ACTIVE).first()
                    
                    if membership:
                        # Find the current active meeting for this Samuha
                        active_meeting = Meeting.objects.filter(
                            samuha=membership.samuha, 
                            status=Meeting.STATUS_ACTIVE
                        ).first()
                        
                        raw_amount = res_data.get('total_amount')
                        if not raw_amount:
                             return Response({"detail": "Payment verified but amount missing in gateway response."}, status=status.HTTP_400_BAD_REQUEST)
                             
                        clean_amount = str(raw_amount).replace(',', '')
                        
                        # Idempotency check
                        if Transaction.objects.filter(external_id=tx_uuid).exists():
                            return Response({"detail": "Monthly saving already recorded for this transaction.", "type": "saving"})
                            
                        Transaction.objects.create(
                            samuha=membership.samuha,
                            user=request.user,
                            meeting=active_meeting,
                            amount=clean_amount,
                            type='saving',
                            external_id=tx_uuid,
                            description=f"Direct eSewa Saving (TX: {tx_uuid}) - {active_meeting.title if active_meeting else 'General'}"
                        )
                        return Response({"detail": "Monthly saving recorded successfully.", "type": "saving"})
                    else:
                        return Response({"detail": "Active membership not found."}, status=status.HTTP_404_NOT_FOUND)

                return Response({"detail": "Payment verified but no action taken.", "res": res_data})
                
            return Response({"detail": "eSewa Verification Failed.", "error": res_data}, status=status.HTTP_400_BAD_REQUEST)
            
        except Plan.DoesNotExist:
            return Response({"detail": "Premium plan configuration missing on server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            import traceback
            error_msg = str(e)
            stack_trace = traceback.format_exc()
            print(f"CRITICAL ERROR in eSewaVerifyView: {error_msg}")
            print(stack_trace)
            from django.conf import settings
            return Response({
                "detail": "Internal Server Error during verification.",
                "error": error_msg,
                "trace": stack_trace if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class eSewaMeetingInitiateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from attendance.models import Meeting
        from ledger.models import Transaction
        from samuha.models import Membership
        
        amount = request.data.get('amount')
        if not amount:
             return Response({"detail": "Amount is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Get User's Samuha
        membership = Membership.objects.filter(user=request.user, status=Membership.STATUS_ACTIVE).first()
        if not membership:
            return Response({"detail": "Active membership not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # 1b. Check and Auto-Create Meeting based on schedule
        get_or_create_scheduled_meeting(membership.samuha)
        
        # 2. Check if user already paid for the CURRENT active meeting
        active_meeting = Meeting.objects.filter(samuha=membership.samuha, status=Meeting.STATUS_ACTIVE).first()
        if active_meeting:
            already_paid = Transaction.objects.filter(
                user=request.user,
                meeting=active_meeting,
                type='saving'
            ).exists()
            
            if already_paid:
                return Response({
                    "detail": "You have already paid for this meeting! ✨",
                    "already_paid": True,
                    "meeting_title": active_meeting.title
                }, status=status.HTTP_400_BAD_REQUEST)

        # 3. Proceed with initiation
        transaction_uuid = f"SV-{uuid.uuid4().hex[:8]}" # SV for Saving
        signature, total_amount = generate_esewa_signature(amount, transaction_uuid)
        
        origin = request.META.get('HTTP_ORIGIN', 'http://localhost:5173')
        
        return Response({
            "signature": signature,
            "transaction_uuid": transaction_uuid,
            "total_amount": total_amount,
            "product_code": "EPAYTEST",
            "success_url": f"{origin}/payment-success",
            "failure_url": f"{origin}/dashboard",
        })

class CalculateMeetingPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1. Get Membership & Samuha
        membership = Membership.objects.filter(
            user=request.user, 
            status=Membership.STATUS_ACTIVE
        ).first()
        
        if not membership:
            return Response({"detail": "No active membership found."}, status=status.HTTP_404_NOT_FOUND)
            
        samuha = membership.samuha
        base_saving = samuha.saving_amount
        
        # 1b. Check and Auto-Create Meeting based on schedule
        get_or_create_scheduled_meeting(samuha)
        
        # 2. Check for fines in PREVIOUS meetings (to collect arrears)
        # We look for the most recent meeting that finished before today
        previous_meeting = Meeting.objects.filter(
            samuha=samuha,
            date__lt=timezone.now().date()
        ).order_by('-date').first()
        
        fines = 0
        breakdown = [
            {"label": "Standard Monthly Saving", "amount": float(base_saving)}
        ]
        
        if previous_meeting:
            attendance = Attendance.objects.filter(meeting=previous_meeting, user=request.user).first()
            if attendance:
                # FIX: Only add fine if it HAS NOT been paid yet
                from ledger.models import Transaction
                fine_already_paid = Transaction.objects.filter(
                    user=request.user, 
                    meeting=previous_meeting, 
                    type=Transaction.TYPE_FINE
                ).exists()

                if not fine_already_paid:
                    if attendance.status == Attendance.STATUS_ABSENT:
                        fines += samuha.absent_fine
                        breakdown.append({"label": f"Arrears: Absent Fine ({previous_meeting.date})", "amount": float(samuha.absent_fine)})
                    elif attendance.status == Attendance.STATUS_LATE:
                        fines += samuha.late_fine
                        breakdown.append({"label": f"Arrears: Late Fine ({previous_meeting.date})", "amount": float(samuha.late_fine)})
            else:
                # If no record but meeting happened, technically absent? 
                # For now, let's assume they might have joined late to the system.
                pass
 
        # 3. Check for fines in CURRENT ACTIVE meeting (Gyanu's case)
        active_meeting = Meeting.objects.filter(
            samuha=samuha,
            status=Meeting.STATUS_ACTIVE
        ).first()

        if active_meeting:
            current_attendance = Attendance.objects.filter(meeting=active_meeting, user=request.user).first()
            if current_attendance and current_attendance.status == Attendance.STATUS_LATE:
                fines += samuha.late_fine
                breakdown.append({"label": "Late Fine (Current Session)", "amount": float(samuha.late_fine)})

        # 4. Check if already paid for this meeting
        already_paid = False
        if active_meeting:
            from ledger.models import Transaction
            already_paid = Transaction.objects.filter(
                user=request.user,
                meeting=active_meeting,
                type='saving'
            ).exists()

        total_amount = float(base_saving + fines)
        
        return Response({
            "samuha_name": samuha.samuha_name,
            "base_saving": base_saving,
            "fines": fines,
            "total_amount": total_amount,
            "breakdown": breakdown,
            "currency": "NPR",
            "already_paid": already_paid,
            "meeting_id": active_meeting.id if active_meeting else None
        })
