from decimal import Decimal
from django.db.models import Sum
from .models import Transaction, Loan
from attendance.models import Attendance
from samuha.models import Membership
from rest_framework.exceptions import ValidationError

def calculate_final_settlement(user, samuha):
    """
    Calculates the final financial settlement for a member leaving the Samuha.
    
    Formula: Total Savings + Profit Share - Unpaid Fines
    
    Profit Share = Total Interest Collected by Samuha ÷ Active Members
    This ensures every member benefits from the interest earned on loans
    that were funded by pooled savings.
    """
    # 1. Check for Active Loans (The Exit Blocker)
    active_loans = Loan.objects.filter(
        user=user, samuha=samuha, 
        status__in=[Loan.STATUS_ACTIVE, Loan.STATUS_APPROVED]
    )
    if active_loans.exists():
        total_loan_due = active_loans.aggregate(
            Sum('remaining_principal')
        )['remaining_principal__sum'] or Decimal('0.00')
        raise ValidationError(
            f"Member has active loan dues of NPR {total_loan_due}. "
            "All loans must be repaid before exit."
        )

    # 2. Calculate Total Savings (what the member put in)
    total_savings = Transaction.objects.filter(
        user=user, samuha=samuha, type=Transaction.TYPE_SAVING
    ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')

    # 3. Calculate Profit Share (interest earned by the community)
    total_interest_collected = Transaction.objects.filter(
        samuha=samuha, type=Transaction.TYPE_INTEREST
    ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')

    active_member_count = Membership.objects.filter(
        samuha=samuha, status=Membership.STATUS_ACTIVE
    ).count()

    if active_member_count > 0:
        profit_share = (total_interest_collected / active_member_count).quantize(Decimal('0.01'))
    else:
        profit_share = Decimal('0.00')

    # 4. Calculate Unpaid Fines (Mandatory Deductions)
    unpaid_fines = Attendance.objects.filter(
        user=user, meeting__samuha=samuha,
        is_paid_fine=False
    ).aggregate(Sum('fine_amount'))['fine_amount__sum'] or Decimal('0.00')

    # 5. Net Settlement
    net_payout = total_savings + profit_share - unpaid_fines

    return {
        "total_savings": total_savings,
        "profit_share": profit_share,
        "total_interest_collected": total_interest_collected,
        "active_member_count": active_member_count,
        "unpaid_fines": unpaid_fines,
        "net_payout": max(net_payout, Decimal('0.00')),
        "has_active_loans": False
    }
