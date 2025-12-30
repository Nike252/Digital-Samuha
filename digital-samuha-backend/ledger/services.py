from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from decimal import Decimal
from datetime import date
from rest_framework.exceptions import ValidationError
from .models import Transaction, Loan
from notifications.utils import notify_user
from samuha.models import Membership

def get_samuha_financial_summary(samuha):
    """
    Calculates the Total Treasury Balance for a Samuha.
    Formula: (Savings + Fines + Repayments + Interest) - (Expenses + Disbursements)
    """
    txs = Transaction.objects.filter(samuha=samuha)
    
    inflow = txs.filter(type__in=[
        Transaction.TYPE_SAVING, 
        Transaction.TYPE_LOAN_REPAYMENT, 
        Transaction.TYPE_INTEREST, 
        Transaction.TYPE_FINE
    ]).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    
    outflow = txs.filter(type__in=[
        Transaction.TYPE_LOAN_DISBURSEMENT, 
        Transaction.TYPE_EXPENSE
    ]).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    
    return inflow - outflow

def calculate_interest_accrued(loan):
    """
    Calculates pro-rated interest since the last activity (disbursement or last update).
    Formula: Principal * (Monthly Rate / 100) * (Days / 30)
    """
    if loan.status != Loan.STATUS_ACTIVE:
        return Decimal('0.00')
    
    # Use the reset 'clock' for subsequent interest
    start_date = loan.interest_last_calculated or loan.disbursed_date or loan.applied_date
    days_elapsed = (timezone.now().date() - start_date).days
    
    # We use a standard 30-day month for Samuha logic
    monthly_rate = loan.interest_rate / Decimal('100.0')
    daily_rate = monthly_rate / Decimal('30.0')
    
    interest = loan.remaining_principal * daily_rate * Decimal(str(days_elapsed))
    return interest.quantize(Decimal('0.01'))

@transaction.atomic
def record_member_contribution(samuha, admin_user, savings_data, meeting):
    """
    Records batch savings and fines for a meeting.
    """
    results = []
    for item in savings_data:
        user_id = item.get('user_id')
        s_amount = Decimal(str(item.get('saving_amount', 0)))
        f_amount = Decimal(str(item.get('fine_amount', 0)))
        
        # 1. Record Saving (Idempotent - get_or_create)
        if s_amount > 0:
            Transaction.objects.get_or_create(
                samuha=samuha, user_id=user_id, meeting=meeting,
                type=Transaction.TYPE_SAVING,
                defaults={
                    'amount': s_amount,
                    'description': f"Monthly Saving - {meeting.date.strftime('%B %Y')}"
                }
            )
        
        # 2. Record Fine (Idempotent - get_or_create)
        if f_amount > 0:
            Transaction.objects.get_or_create(
                samuha=samuha, user_id=user_id, meeting=meeting,
                type=Transaction.TYPE_FINE,
                defaults={
                    'amount': f_amount,
                    'description': f"Meeting Fine - {meeting.date.strftime('%B %Y')}"
                }
            )
        results.append(user_id)
    return len(results)

@transaction.atomic
def disburse_loan_funds(loan_id, admin_user):
    """
    Validates treasury and disburses loan.
    """
    loan = Loan.objects.select_for_update().get(id=loan_id)
    if loan.status != Loan.STATUS_APPROVED:
        raise ValidationError("Loan must be approved before disbursement.")
    
    # Treasury Check (The Guard)
    total_fund = get_samuha_financial_summary(loan.samuha)
    if loan.principal_amount > total_fund:
        raise ValidationError(f"Insufficient Samuha Funds. Current Treasury: NPR {total_fund}. Loan: NPR {loan.principal_amount}.")
    
    # 1. Create Disbursement Transaction
    Transaction.objects.create(
        samuha=loan.samuha, user=loan.user,
        type=Transaction.TYPE_LOAN_DISBURSEMENT,
        amount=loan.principal_amount,
        description=f"Loan Disbursement: {loan.purpose}"
    )
    
    # 2. Finalize Loan State
    loan.status = Loan.STATUS_ACTIVE
    loan.disbursed_date = timezone.now().date()
    loan.remaining_principal = loan.principal_amount
    loan.interest_last_calculated = loan.disbursed_date
    loan.save()
    
    notify_user(loan.user, "Loan Disbursed 💰", f"NPR {loan.principal_amount} has been added to your account.")
    return loan

@transaction.atomic
def process_loan_repayment(loan_id, amount_paid):
    """
    Declining Balance Repayment: Interest cleared first, then Principal.
    """
    loan = Loan.objects.select_for_update().get(id=loan_id)
    if loan.status != Loan.STATUS_ACTIVE:
        raise ValidationError("Only active loans can be repaid.")
    
    amount = Decimal(str(amount_paid))
    accrued_interest = calculate_interest_accrued(loan)
    
    # 1. Handle Interest
    interest_payment = min(amount, accrued_interest)
    if interest_payment > 0:
        Transaction.objects.create(
            samuha=loan.samuha, user=loan.user,
            type=Transaction.TYPE_INTEREST,
            amount=interest_payment,
            description=f"Interest Payment for {loan.purpose}"
        )
        loan.total_interest_paid += interest_payment
        amount -= interest_payment
    
    # 2. Handle Principal
    principal_payment = min(amount, loan.remaining_principal)
    if principal_payment > 0:
        Transaction.objects.create(
            samuha=loan.samuha, user=loan.user,
            type=Transaction.TYPE_LOAN_REPAYMENT,
            amount=principal_payment,
            description=f"Principal Repayment for {loan.purpose}"
        )
        loan.remaining_principal -= principal_payment
    
    # 3. Finalize
    loan.interest_last_calculated = timezone.now().date()
    
    if loan.remaining_principal <= 0:
        loan.status = Loan.STATUS_PAID
        loan.closed_date = timezone.now().date()
    
    loan.save()
    return loan
