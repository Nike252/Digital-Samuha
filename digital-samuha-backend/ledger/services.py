from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from decimal import Decimal
from datetime import date
from rest_framework.exceptions import ValidationError
from .models import Transaction, Loan
from notifications.utils import notify_user
from samuha.models import Membership

def is_meeting_locked_for_user(meeting, user):
    """
    Checks if a meeting is 'locked' for a user (no more attendance changes allowed).
    Locked if: a 'saving' or 'fine' transaction already exists for this meeting/user.
    """
    return Transaction.objects.filter(
        meeting=meeting, 
        user=user, 
        type__in=[Transaction.TYPE_SAVING, Transaction.TYPE_FINE]
    ).exists()

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
        Transaction.TYPE_EXPENSE,
        Transaction.TYPE_DISTRIBUTION,
        Transaction.TYPE_LIQUIDATION
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
            from attendance.models import Attendance
            Attendance.objects.filter(meeting=meeting, user_id=user_id).update(is_paid_saving=True)
        
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
            from attendance.models import Attendance
            Attendance.objects.filter(meeting=meeting, user_id=user_id).update(is_paid_fine=True)
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

def get_member_payout_data(user, samuha):
    """
    Calculates exactly what a member would receive if they exited today.
    Formula: Personal Savings + (Collective Profit Pool / Active Members)
    """
    total_fund = get_samuha_financial_summary(samuha)
    
    savings_in = Transaction.objects.filter(
        samuha=samuha, user=user, type=Transaction.TYPE_SAVING
    ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

    savings_out = Transaction.objects.filter(
        samuha=samuha, user=user, type=Transaction.TYPE_LIQUIDATION
    ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

    personal_savings = max(Decimal('0.00'), savings_in - savings_out)

    # Collective ratio uses the same Net Savings logic
    total_savings_in = Transaction.objects.filter(
        samuha=samuha, 
        type=Transaction.TYPE_SAVING,
        user__memberships__samuha=samuha,
        user__memberships__status=Membership.STATUS_ACTIVE
    ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

    total_savings_out = Transaction.objects.filter(
        samuha=samuha, 
        type=Transaction.TYPE_LIQUIDATION,
        user__memberships__samuha=samuha,
        user__memberships__status=Membership.STATUS_ACTIVE
    ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

    all_active_savings = max(Decimal('0.00'), total_savings_in - total_savings_out)

    # NEW: Total Clearing Logic (Pool = Everything - Total Active Savings)
    current_pool = max(Decimal('0.00'), total_fund - all_active_savings)
    
    # NEW: Equal Share Fallback for Zero-Savings Reset Cycles
    if all_active_savings == 0:
        active_member_count = Membership.objects.filter(samuha=samuha, status=Membership.STATUS_ACTIVE).count()
        share_ratio = Decimal(1) / Decimal(active_member_count) if active_member_count > 0 else Decimal(0)
    else:
        share_ratio = personal_savings / all_active_savings
    
    share_of_profit = (current_pool * share_ratio).quantize(Decimal('0.01'))

    return {
        "personal_savings": personal_savings.quantize(Decimal('1.00')),
        "share_of_profit": share_of_profit.quantize(Decimal('1.00')),
        "total_payout": (personal_savings + share_of_profit).quantize(Decimal('1.00'))
    }

def get_samuha_distribution_preview(samuha):
    """
    Returns a detailed breakdown for every active member for the distribution preview.
    """
    active_memberships = Membership.objects.filter(samuha=samuha, status=Membership.STATUS_ACTIVE).select_related('user')
    member_count = active_memberships.count()
    if member_count == 0:
        return {"total_fund": 0, "members": []}

    total_fund = get_samuha_financial_summary(samuha)

    # Proportional Math: Sum of all active members' net savings
    total_savings_in = Transaction.objects.filter(
        samuha=samuha, 
        type=Transaction.TYPE_SAVING,
        user__memberships__samuha=samuha,
        user__memberships__status=Membership.STATUS_ACTIVE
    ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

    total_savings_out = Transaction.objects.filter(
        samuha=samuha, 
        type=Transaction.TYPE_LIQUIDATION,
        user__memberships__samuha=samuha,
        user__memberships__status=Membership.STATUS_ACTIVE
    ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
    
    total_active_savings = max(Decimal('0.00'), total_savings_in - total_savings_out)

    # NEW: Total Clearing Logic (Pool = Everything - Total Active Savings)
    current_pool = max(Decimal('0.00'), total_fund - total_active_savings)
    
    # Fallback to Equal Share if for some reason savings are 0 (e.g. at start of cycle)
    use_equal_fallback = (total_active_savings == 0)
    if use_equal_fallback:
         fallback_ratio = Decimal(1) / Decimal(member_count)

    members_data = []
    # Pre-fetch all performance relevant transactions for efficiency if needed, but for small groups simple query is fine
    for m in active_memberships:
        user_txs = Transaction.objects.filter(samuha=samuha, user=m.user)
        
        mem_savings_in = user_txs.filter(type=Transaction.TYPE_SAVING).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
        mem_savings_out = user_txs.filter(type=Transaction.TYPE_LIQUIDATION).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
        savings = max(Decimal('0.00'), mem_savings_in - mem_savings_out)

        fines = user_txs.filter(type=Transaction.TYPE_FINE).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
        interest = user_txs.filter(type=Transaction.TYPE_INTEREST).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

        # Weighted Dividend vs Equal Share Fallback
        if use_equal_fallback:
             share_ratio = fallback_ratio
        else:
             share_ratio = (savings / total_active_savings) if total_active_savings > 0 else Decimal('0')
             
        member_dividend = (current_pool * share_ratio).quantize(Decimal('0.01'))

        # We can further split fines if needed, but for now aggregate is fine
        members_data.append({
            "id": m.user.id,
            "name": m.user.full_name,
            "savings": savings,
            "fines": fines,
            "interest": interest,
            "dividend": member_dividend,
            "total_payout": savings + member_dividend
        })

    return {
        "total_fund": total_fund,
        "current_pool": current_pool,
        "total_active_savings": total_active_savings,
        "member_count": member_count,
        "members": members_data
    }

@transaction.atomic
def execute_samuha_distribution(samuha, admin_user, is_dissolve=False):
    """
    1. Share profits (Interests & Fines) proportionally based on individual savings.
    2. If is_dissolve: Mark all memberships as exited and Samuha as dissolved.
    3. Generate and archive an Official PDF Payout Report.
    """
    # 1. Loan Guard (Strict Settlement First)
    # Check for any loan with remaining principal > 0
    overdue_loans = Loan.objects.filter(samuha=samuha, remaining_principal__gt=0)
    if overdue_loans.exists():
        names = ", ".join([f"{l.user.full_name} (NPR {l.remaining_principal})" for l in overdue_loans])
        raise ValidationError(f"Cannot distribute funds while outstanding loans exist. Please settle these loans first: {names}")

    # ALSO check statuses just in case of inconsistency
    active_loans = Loan.objects.filter(samuha=samuha, status__in=[Loan.STATUS_ACTIVE, Loan.STATUS_APPROVED])
    if active_loans.exists():
        names = ", ".join([l.user.full_name for l in active_loans])
        raise ValidationError(f"Cannot distribute funds while active/approved loans exist: {names}")

    active_memberships = Membership.objects.filter(samuha=samuha, status=Membership.STATUS_ACTIVE).select_related('user')
    member_count = active_memberships.count()
    if member_count == 0:
        return 0

    # 2. Financial Aggregation
    total_profit_pool = Transaction.objects.filter(
        samuha=samuha, 
        type__in=[Transaction.TYPE_INTEREST, Transaction.TYPE_FINE]
    ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

    past_distributions = Transaction.objects.filter(
        samuha=samuha, type=Transaction.TYPE_DISTRIBUTION
    ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

    total_fund = get_samuha_financial_summary(samuha)
    
    total_savings_in = Transaction.objects.filter(
        samuha=samuha, 
        type=Transaction.TYPE_SAVING,
        user__memberships__samuha=samuha,
        user__memberships__status=Membership.STATUS_ACTIVE
    ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

    total_savings_out = Transaction.objects.filter(
        samuha=samuha, 
        type=Transaction.TYPE_LIQUIDATION,
        user__memberships__samuha=samuha,
        user__memberships__status=Membership.STATUS_ACTIVE
    ).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
    
    total_active_savings = max(Decimal('0.00'), total_savings_in - total_savings_out)

    # NEW: Total Fresh Start Logic (Pool = Entire Treasury)
    # We distribute EVERYTHING proportionally to hit absolute 0.00
    distribution_pool = total_fund
    
    # Check if there are any savings at all to use as a ratio
    use_equal_fallback = (total_active_savings == 0)
    if use_equal_fallback:
         fallback_ratio = Decimal(1) / Decimal(member_count)

    # FINAL RESET CHECK
    if distribution_pool > total_fund:
         diff = distribution_pool - total_fund
         raise ValidationError(f"Treasury Inconsistency: Need NPR {distribution_pool} for full distribution, but only NPR {total_fund} is available.")

    report_data = []
    distributed_dividend_total = Decimal('0.00')

    # 3. Execution Loop
    for index, membership in enumerate(active_memberships):
        user = membership.user
        is_last_member = (index == len(active_memberships) - 1)
        
        # A. Member Stats for PDF Report
        user_txs = Transaction.objects.filter(samuha=samuha, user=user)
        
        mem_savings_in = user_txs.filter(type=Transaction.TYPE_SAVING).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
        mem_savings_out = user_txs.filter(type=Transaction.TYPE_LIQUIDATION).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
        savings = max(Decimal('0.00'), mem_savings_in - mem_savings_out)

        fines = user_txs.filter(type=Transaction.TYPE_FINE).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
        interest = user_txs.filter(type=Transaction.TYPE_INTEREST).aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')

        # B. Proportional Fresh-Start calculation
        if is_last_member:
            # SWEEP LOGIC: Last member gets every remaining paisa 
            # to ensures treasury hits exactly 0.00
            total_user_payout = distribution_pool - distributed_dividend_total
        else:
            if use_equal_fallback:
                share_ratio = fallback_ratio
            else:
                share_ratio = (savings / total_active_savings) if total_active_savings > 0 else Decimal('0')
                
            total_user_payout = (distribution_pool * share_ratio).quantize(Decimal('0.01'))
            distributed_dividend_total += total_user_payout

        # Dividend is the "Profit" part (Payout - Savings)
        dividend_part = max(Decimal('0.00'), total_user_payout - savings)

        # C. Distribution Transactions
        if dividend_part > 0:
            Transaction.objects.create(
                samuha=samuha,
                user=user,
                type=Transaction.TYPE_DISTRIBUTION,
                amount=dividend_part,
                date=timezone.now().date(),
                description=f"{'Final Liquidation Dividend' if is_dissolve else 'Cyclical Distribution Profit'}"
            )

        if savings > 0:
            Transaction.objects.create(
                samuha=samuha,
                user=user,
                type=Transaction.TYPE_LIQUIDATION,
                amount=savings,
                date=timezone.now().date(),
                description=f"{'Final Dissolution' if is_dissolve else 'Cyclical'} Savings Return (Reset)"
            )

        report_data.append({
            "name": user.full_name,
            "savings": float(savings),
            "fines": float(fines),
            "interest": float(interest),
            "dividend": float(dividend_part),
            "total": float(total_user_payout)
        })

        if is_dissolve:
            # E. Deactivate Membership
            membership.status = Membership.STATUS_EXITED
            membership.exited_at = timezone.now()
            membership.is_approved = False # Prevent accidental re-login/active status
            membership.save()

    if is_dissolve:
        samuha.status = 'inactive' # Use custom status for front-end blocking
        samuha.save()

    # --- PDF ARCHIVAL LOGIC (Fixed using ReportLab) ---
    try:
        from documents.models import Document
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors
        import io

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        title_text = f"Official Payout Report - {'DISSOLUTION' if is_dissolve else 'ANNUAL DISTRIBUTION'}"
        elements.append(Paragraph(title_text, styles['Title']))
        elements.append(Spacer(1, 12))

        # Metadata
        elements.append(Paragraph(f"<b>Organization:</b> {samuha.samuha_name}", styles['Normal']))
        elements.append(Paragraph(f"<b>Generated Date:</b> {timezone.now().date()}", styles['Normal']))
        elements.append(Paragraph(f"<b>Generated By:</b> {admin_user.full_name}", styles['Normal']))
        elements.append(Spacer(1, 24))

        # Table Data
        data = [['Member Name', 'Savings', 'Fines', 'Interest', 'Dividend', 'NET PAYOUT']]
        for rd in report_data:
            data.append([
                rd['name'],
                f"NPR {rd['savings']}",
                f"NPR {rd['fines']}",
                f"NPR {rd['interest']}",
                f"NPR {rd['dividend']}",
                f"NPR {rd['total']}"
            ])

        # Table Styling
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.indigo),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.beige),
            ('GRID', (0,0), (-1,-1), 1, colors.black)
        ]))
        elements.append(table)

        # Build PDF
        doc.build(elements)
        pdf_content = buffer.getvalue()
        
        from django.core.files.base import ContentFile
        filename = f"Payout_{'Dissolution' if is_dissolve else 'Dividend'}_{timezone.now().strftime('%Y%m%d_%H%M')}.pdf"
        
        Document.objects.create(
            samuha=samuha,
            title=f"{'Final Liquidation' if is_dissolve else 'Annual Distribution'} Report",
            category='payout',
            file=ContentFile(pdf_content, name=filename),
            uploaded_by=admin_user
        )
    except Exception as e:
        # We don't want to fail the whole transaction if PDF generation hits a snag, 
        # but in a real app we'd log this properly.
        print(f"PAYOUT PDF ERROR: {str(e)}")

    return member_count
