from decimal import Decimal
from django.db.models import Sum
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from .models import Transaction, Loan
from .serializers import TransactionSerializer, LoanSerializer
from .import services
from samuha.models import Membership, Samuha
from attendance.models import Meeting
from dateutil.relativedelta import relativedelta
from django.utils import timezone

class LedgerBaseViewSet(viewsets.ModelViewSet):
    """Base ViewSet with Multi-Tenancy filtering."""
    permission_classes = [permissions.IsAuthenticated]

    def get_samuha(self):
        membership = Membership.objects.filter(
            user=self.request.user, 
            status=Membership.STATUS_ACTIVE
        ).first()
        if not membership:
            raise PermissionDenied("You are not an active member of any Samuha.")
        return membership.samuha, membership.role

    def get_queryset(self):
        samuha, _ = self.get_samuha()
        return self.queryset.filter(samuha=samuha)

    def perform_create(self, serializer):
        samuha, _ = self.get_samuha()
        serializer.save(samuha=samuha)

class TransactionViewSet(LedgerBaseViewSet):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Support filtering by meeting ID (used by Attendance page)
        meeting_id = self.request.query_params.get('meeting')
        if meeting_id:
            qs = qs.filter(meeting_id=meeting_id)
        return qs

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Block deletion of critical transaction types
        protected_types = [
            Transaction.TYPE_LOAN_DISBURSEMENT,
            Transaction.TYPE_LOAN_REPAYMENT,
            # Transaction.TYPE_SAVING  # Optional: Protect savings too? 
            # For now, let's just fix the reported loan bug.
        ]
        
        if instance.type in protected_types:
            raise ValidationError({
                "detail": f"This '{instance.get_type_display()}' transaction is protected and cannot be deleted. "
                          "Loan-related records must be voided or adjusted through the Loan Manager "
                          "to maintain financial integrity."
            })
            
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'], url_path='batch-savings')
    def batch_savings(self, request):
        samuha, role = self.get_samuha()
        if role not in [Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA]:
            raise PermissionDenied("Only Adhakshya or Co-Adhakshya can record batch savings.")
        
        savings_data = request.data.get('savings', [])
        meeting_id = request.data.get('meeting_id')
        meeting = get_object_or_404(Meeting, id=meeting_id, samuha=samuha)
        
        count = services.record_member_contribution(samuha, request.user, savings_data, meeting)
        return Response({"detail": f"Recorded savings for {count} members."}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        samuha, _ = self.get_samuha()
        total_fund = services.get_samuha_financial_summary(samuha)
        
        # Personal Stats
        my_savings = Transaction.objects.filter(
            samuha=samuha, user=request.user, type=Transaction.TYPE_SAVING
        ).aggregate(sum=Sum('amount'))['sum'] or 0
        
        # Active Loans Stats
        active_loans = Loan.objects.filter(samuha=samuha, status=Loan.STATUS_ACTIVE)
        loans_total = active_loans.aggregate(sum=Sum('remaining_principal'))['sum'] or 0
        
        return Response({
            "total_fund": total_fund,
            "my_savings": my_savings,
            "active_loans_total": loans_total,
            "total_members": Membership.objects.filter(samuha=samuha, status=Membership.STATUS_ACTIVE).count()
        })

class LoanViewSet(LedgerBaseViewSet):
    queryset = Loan.objects.all().order_by('-id')
    serializer_class = LoanSerializer

    def get_queryset(self):
        samuha, _ = self.get_samuha()
        return Loan.objects.filter(samuha=samuha).order_by('-id')

    def perform_create(self, serializer):
        samuha, _ = self.get_samuha()
        # Auto-inject loan interest rate from Samuha rules
        serializer.save(
            samuha=samuha, 
            interest_rate=samuha.loan_interest_rate
        )

    @action(detail=True, methods=['post'])
    def manage(self, request, pk=None):
        """Action for Approve/Reject."""
        loan = self.get_object()
        samuha, role = self.get_samuha()
        if role != Membership.ROLE_ADHAKSHYA:
            raise PermissionDenied("Only the Adhakshya can approve or reject loans.")
        
        action_type = request.data.get('action')
        from notifications.utils import notify_user
        
        if action_type == 'approve':
            loan.status = Loan.STATUS_APPROVED
            loan.approved_date = timezone.now().date()
            loan.save()
            notify_user(
                user=loan.user,
                title="Loan Approved! 🎉",
                message=f"Your loan request for NPR {loan.principal_amount} has been approved by the Adhakshya.",
                type="loan"
            )
            return Response({"detail": "Loan approved."})
        elif action_type == 'reject':
            loan.status = Loan.STATUS_REJECTED
            loan.save()
            notify_user(
                user=loan.user,
                title="Loan Application Update",
                message=f"Your loan request for NPR {loan.principal_amount} was reviewed but unfortunately rejected at this time.",
                type="loan"
            )
            return Response({"detail": "Loan rejected."})
        return Response({"error": "Invalid action."}, status=400)

    @action(detail=True, methods=['post'])
    def disburse(self, request, pk=None):
        samuha, role = self.get_samuha()
        if role != Membership.ROLE_ADHAKSHYA:
            raise PermissionDenied("Only the Adhakshya can disburse loan funds.")
        
        loan = services.disburse_loan_funds(pk, request.user)
        return Response({"detail": "Loan disbursed.", "status": loan.status})

    @action(detail=True, methods=['post'])
    def repay(self, request, pk=None):
        amount = request.data.get('amount')
        if not amount:
            raise ValidationError("Amount is required for repayment.")
        
        # Permission logic: Adhakshya, Co-Adhakshya or the Borrower themselves
        loan = get_object_or_404(Loan, id=pk)
        from samuha.models import Membership
        membership = Membership.objects.filter(user=request.user, samuha=loan.samuha).first()
        is_admin = membership and membership.role in [Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA]
        is_borrower = (loan.user == request.user)

        if not (is_admin or is_borrower):
            raise PermissionDenied("You do not have permission to record repayment for this loan.")

        loan = services.process_loan_repayment(pk, amount)
        return Response({
            "detail": "Repayment recorded successfully. ✅", 
            "remaining_principal": loan.remaining_principal,
            "status": loan.status
        })
    @action(detail=False, methods=['get'])
    def predict(self, request):
        """AI-based loan risk assessment using real ML model and internal Samuha data."""
        samuha, _ = self.get_samuha()
        
        # 1. Premium Check
        if not samuha.is_premium:
            return Response({
                "error": "AI Prediction is a Premium feature. Please upgrade your Samuha plan."
            }, status=status.HTTP_403_FORBIDDEN)
            
        # 2. Get Input Data
        try:
            loan_id = request.query_params.get('loan_id')
            if not loan_id:
                return Response({"error": "Loan ID is required for AI analysis."}, status=400)
            
            loan = get_object_or_404(Loan, id=loan_id, samuha=samuha)
            applicant = loan.user
            
            # --- AUTO-CALCULATE INTERNAL TRUST FACTORS ---
            
            # A. Membership Age (in days)
            membership = Membership.objects.filter(user=applicant, samuha=samuha).first()
            if not membership:
                return Response({"error": "Applicant is not a member of this Samuha."}, status=400)
            
            membership_age_days = (timezone.now() - membership.joined_at).days
            
            # B. Savings Consistency (Last 6 months)
            # Check how many monthly savings transactions exist for this user in the last 6 months
            six_months_ago = timezone.now().date() - relativedelta(months=6)
            savings_count = Transaction.objects.filter(
                user=applicant, 
                samuha=samuha, 
                type=Transaction.TYPE_SAVING,
                date__gte=six_months_ago
            ).count()
            # 6 savings in 6 months = 1.0 consistency
            savings_consistency = min(1.0, savings_count / 6.0)
            
            # C. Collateral Ratio (Total Savings / Requested Loan)
            total_savings = Transaction.objects.filter(
                user=applicant,
                samuha=samuha,
                type=Transaction.TYPE_SAVING
            ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
            
            collateral_ratio = float(total_savings / loan.principal_amount) if loan.principal_amount > 0 else 0.0

            # 3. Load ML Model and Predict
            import joblib
            import numpy as np
            import os
            
            # Debugging Path: Try relative first, then BASE_DIR
            MODEL_NAME = 'samuha_loan_model.joblib'
            MODEL_PATH = os.path.join(settings.BASE_DIR, 'ml_models', MODEL_NAME)
            
            # Fallback for some project structures
            if not os.path.exists(MODEL_PATH):
                 MODEL_PATH = os.path.join(os.getcwd(), 'ml_models', MODEL_NAME)

            print(f"--- AI DIAGNOSTICS ---")
            print(f"Looking for model at: {MODEL_PATH}")
            print(f"Exists: {os.path.exists(MODEL_PATH)}")
            
            if not os.path.exists(MODEL_PATH):
                 return Response({
                     "error": "AI Model not found on server.",
                     "debug_path": MODEL_PATH
                 }, status=500)
            
            model = joblib.load(MODEL_PATH)
            
            # Features: ['annual_income', 'loan_amount', 'savings_consistency', 'membership_age_days', 'collateral_ratio']
            features = np.array([[
                float(loan.annual_income),
                float(loan.principal_amount),
                float(savings_consistency),
                float(membership_age_days),
                float(collateral_ratio)
            ]])
            
            # Get Probabilities
            probs = model.predict_proba(features)[0] # [Safe_Prob, Default_Prob]
            default_prob = float(probs[1]) * 100
            
            # AI Logic Mapping
            risk_score = default_prob
            grade = "A"
            recommendation = "सिफारिस गरिएको"
            
            if risk_score > 20: 
                grade = "B"
                recommendation = "होसियारीका साथ स्विकृत गर्नुहोस्"
            if risk_score > 50:
                grade = "C"
                recommendation = "अलि जोखिमपूर्ण - राम्ररी बुझ्नुहोस्"
            if risk_score > 75:
                grade = "D"
                recommendation = "उच्च जोखिम - अस्विकृत गर्नुहोस्"
                
            return Response({
                "risk_score": round(float(risk_score), 1),
                "grade": grade,
                "recommendation": recommendation,
                "ai_analysis": {
                    "savings_consistency": f"{int(savings_consistency * 100)}%",
                    "membership_age": f"{membership_age_days} दिन",
                    "collateral_coverage": f"{int(collateral_ratio * 100)}%",
                    "default_probability": f"{round(float(default_prob), 1)}%"
                },
                "details": f"AI analysis based on {grade} grade risk profile."
            })

        except Exception as e:
            print(f"--- AI CRASH ---")
            print(str(e))
            import traceback
            traceback.print_exc()
            return Response({"error": f"AI Engine Error: {str(e)}"}, status=500)
