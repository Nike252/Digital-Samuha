import os
import django
import sys

# Setup Django environment
sys.path.append(r'd:\FYP\digital-samuha-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_samuha.settings')
django.setup()

from ledger.models import Loan
from ledger.ai_utils import predict_loan_default

# Try to get the latest loan
loan = Loan.objects.last()
if not loan:
    print("No loans found in database!")
    sys.exit(1)

print(f"Testing prediction for Loan ID: {loan.id}")
print(f"Loan Details: Amt={loan.principal_amount}, Term={loan.loan_term}, Grade={loan.credit_grade}")

result = predict_loan_default(loan)
print(f"Prediction Result: {result}")
