import os
import django
import sys
from decimal import Decimal
from django.utils import timezone
from dateutil.relativedelta import relativedelta

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_samuha.settings')
sys.path.append(r'd:\FFYYPP\FYP\digital-samuha-backend')
django.setup()

from ledger.models import Loan, Transaction
from samuha.models import Membership
from django.shortcuts import get_object_or_404
from django.conf import settings
import joblib
import numpy as np

def test_prediction_logic():
    print("--- STARTING PREDICTION DEBUG ---")
    try:
        # 1. Grab a loan to test with
        loan = Loan.objects.first()
        if not loan:
            print("ERROR: No loans found in DB.")
            return
            
        print(f"Testing with Loan ID: {loan.id} for User: {loan.user}")
        applicant = loan.user
        samuha = loan.samuha

        # 2. Re-run internal logic
        membership = Membership.objects.filter(user=applicant, samuha=samuha).first()
        membership_age_days = (timezone.now() - membership.joined_at).days
        print(f"Membership Age: {membership_age_days} days")

        six_months_ago = timezone.now().date() - relativedelta(months=6)
        savings_count = Transaction.objects.filter(
            user=applicant, 
            samuha=samuha, 
            type=Transaction.TYPE_SAVING,
            date__gte=six_months_ago
        ).count()
        savings_consistency = min(1.0, savings_count / 6.0)
        print(f"Savings Consistency: {savings_consistency}")

        from django.db.models import Sum
        total_savings = Transaction.objects.filter(
            user=applicant,
            samuha=samuha,
            type=Transaction.TYPE_SAVING
        ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
        print(f"Total Savings: {total_savings}")

        collateral_ratio = float(total_savings / loan.principal_amount) if loan.principal_amount > 0 else 0.0
        print(f"Collateral Ratio: {collateral_ratio}")

        # 3. Model Load
        MODEL_PATH = os.path.join(settings.BASE_DIR, 'ml_models', 'samuha_loan_model.joblib')
        print(f"Checking Model Path: {MODEL_PATH}")
        if not os.path.exists(MODEL_PATH):
            print(f"ERROR: Model file NOT FOUND at {MODEL_PATH}")
            return
        
        model = joblib.load(MODEL_PATH)
        print("Model Loaded Successfully.")

        features = np.array([[
            float(loan.annual_income),
            float(loan.principal_amount),
            float(savings_consistency),
            float(membership_age_days),
            float(collateral_ratio)
        ]])
        print(f"Features Array: {features}")

        probs = model.predict_proba(features)[0]
        print(f"Probabilities: {probs}")
        print("SUCCESS: Full AI prediction logic worked.")

    except Exception as e:
        print(f"CRASH DETECTED: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_prediction_logic()
