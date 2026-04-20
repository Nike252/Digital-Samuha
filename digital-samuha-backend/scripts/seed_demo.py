"""
Demo Samuha Seeder - "Sagarmatha Pragati Samuha"
Creates a realistic 1-year history with 10 members, savings, attendance, and loans.
Run: python manage.py shell < seed_demo.py
"""
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_samuha.settings')
django.setup()

from decimal import Decimal
from datetime import date, timedelta, datetime
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from users.models import User
from samuha.models import Samuha, Membership
from attendance.models import Meeting, Attendance
from ledger.models import Transaction, Loan
import random

print("=" * 60)
print("  DEMO SAMUHA SEEDER - Sagarmatha Pragati Samuha")
print("=" * 60)

# ─── CONFIG ──────────────────────────────────────────────
PASSWORD = "Demo@12345"
SAVING_AMOUNT = Decimal("1000.00")
ABSENT_FINE = Decimal("100.00")
LATE_FINE = Decimal("50.00")
INTEREST_RATE = Decimal("1.00")  # 1% monthly

MEMBERS_DATA = [
    # (phone, first_name, last_name, role, citizenship_no)
    ("9801000001", "Ram",     "Adhikari",  "adhakshya",    "12-34-56789"),
    ("9801000002", "Sita",    "Sharma",    "co_adhakshya", "23-45-67890"),
    ("9801000003", "Hari",    "Thapa",     "member",       "34-56-78901"),
    ("9801000004", "Gita",    "Gurung",    "member",       "45-67-89012"),
    ("9801000005", "Bikram",  "Rai",       "member",       "56-78-90123"),
    ("9801000006", "Sarita",  "Tamang",    "member",       "67-89-01234"),
    ("9801000007", "Deepak",  "Magar",     "member",       "78-90-12345"),
    ("9801000008", "Anita",   "Bhandari",  "member",       "89-01-23456"),
    ("9801000009", "Suresh",  "Shrestha",  "member",       "90-12-34567"),
    ("9801000010", "Kamala",  "Poudel",    "member",       "01-23-45678"),
]

# ─── STEP 1: Create Samuha ───────────────────────────────
print("\n[1/6] Creating Samuha...")

# Create Adhakshya user first
adhakshya_user, created = User.objects.get_or_create(
    phone="9801000001",
    defaults={"first_name": "Ram", "last_name": "Adhikari"}
)
if created:
    adhakshya_user.set_password(PASSWORD)
    adhakshya_user.save()

samuha, created = Samuha.objects.get_or_create(
    samuha_name="Sagarmatha Pragati Samuha",
    defaults={
        "province": "Bagmati",
        "district": "Kathmandu",
        "municipality": "Kathmandu Metropolitan City",
        "ward_number": "10",
        "adhakshya_full_name": "Ram Adhikari",
        "adhakshya_phone": "9801000001",
        "adhakshya_email": "ram.adhikari@demo.com",
        "adhakshya_citizenship_no": "12-34-56789",
        "status": Samuha.STATUS_ACTIVE,
        "created_by": adhakshya_user,
        "meeting_schedule_type": "fixed_date",
        "meeting_day": "Saturday",
        "meeting_day_numeric": 15,
        "meeting_frequency": "Monthly",
        "saving_amount": SAVING_AMOUNT,
        "absent_fine": ABSENT_FINE,
        "late_fine": LATE_FINE,
        "loan_interest_rate": INTEREST_RATE,
        "default_meeting_time": "10:00:00",
    }
)
if created:
    print(f"   ✅ Created: {samuha} (Code: {samuha.samuha_code})")
else:
    print(f"   ⚠️  Already exists: {samuha} (Code: {samuha.samuha_code})")

# ─── STEP 2: Create Members ──────────────────────────────
print("\n[2/6] Creating 10 members...")
users = []
for phone, fname, lname, role, cit_no in MEMBERS_DATA:
    user, created = User.objects.get_or_create(
        phone=phone,
        defaults={"first_name": fname, "last_name": lname}
    )
    if created:
        user.set_password(PASSWORD)
        user.save()
        print(f"   ✅ User: {fname} {lname} ({phone})")
    else:
        print(f"   ⚠️  Exists: {fname} {lname} ({phone})")

    membership, m_created = Membership.objects.get_or_create(
        user=user, samuha=samuha,
        defaults={
            "role": role,
            "status": Membership.STATUS_ACTIVE,
            "is_approved": True,
            "citizenship_no": cit_no,
        }
    )
    users.append(user)

print(f"   Total members: {len(users)}")

# ─── STEP 3: Create 12 months of Meetings ────────────────
print("\n[3/6] Creating 12 monthly meetings (1 year history)...")
today = date.today()
meetings = []

for i in range(12, 0, -1):
    meeting_date = today - relativedelta(months=i)
    # Set to the 15th of that month
    meeting_date = meeting_date.replace(day=15)
    
    meeting, created = Meeting.objects.get_or_create(
        samuha=samuha,
        date=meeting_date,
        defaults={
            "title": f"Monthly Meeting - {meeting_date.strftime('%B %Y')}",
            "start_time": "10:00:00",
            "status": Meeting.STATUS_COMPLETED,
        }
    )
    meetings.append(meeting)
    if created:
        # Fix created_at to match meeting date
        Meeting.objects.filter(pk=meeting.pk).update(
            created_at=timezone.make_aware(datetime.combine(meeting_date, datetime.min.time()))
        )
        print(f"   ✅ Meeting: {meeting_date.strftime('%b %d, %Y')}")

print(f"   Total meetings: {len(meetings)}")

# ─── STEP 4: Create Attendance + Savings ──────────────────
print("\n[4/6] Creating attendance records & saving transactions...")
total_savings = 0
total_fines = 0

for month_idx, meeting in enumerate(meetings):
    for user in users:
        # Simulate realistic attendance: ~80% present, ~10% late, ~10% absent
        roll = random.random()
        if roll < 0.80:
            att_status = Attendance.STATUS_PRESENT
            fine = Decimal("0.00")
            is_paid_fine = True
        elif roll < 0.90:
            att_status = Attendance.STATUS_LATE
            fine = LATE_FINE
            # Most fines are paid
            is_paid_fine = random.random() < 0.7
        else:
            att_status = Attendance.STATUS_ABSENT
            fine = ABSENT_FINE
            is_paid_fine = random.random() < 0.6

        att, created = Attendance.objects.get_or_create(
            meeting=meeting,
            user=user,
            defaults={
                "status": att_status,
                "fine_amount": fine,
                "is_paid_saving": True,  # Everyone pays savings
                "is_paid_fine": is_paid_fine,
            }
        )

        # Record saving transaction
        if created:
            txn = Transaction.objects.create(
                samuha=samuha,
                user=user,
                meeting=meeting,
                type=Transaction.TYPE_SAVING,
                amount=SAVING_AMOUNT,
                description=f"Monthly Saving - {meeting.date.strftime('%B %Y')}",
            )
            # Backdate the transaction
            Transaction.objects.filter(pk=txn.pk).update(
                date=meeting.date,
                created_at=timezone.make_aware(datetime.combine(meeting.date, datetime.min.time()))
            )
            total_savings += 1

            # Record fine payment if paid
            if fine > 0 and is_paid_fine:
                fine_txn = Transaction.objects.create(
                    samuha=samuha,
                    user=user,
                    meeting=meeting,
                    type=Transaction.TYPE_FINE,
                    amount=fine,
                    description=f"Fine Payment ({att_status}) - {meeting.date.strftime('%B %Y')}",
                )
                Transaction.objects.filter(pk=fine_txn.pk).update(
                    date=meeting.date,
                    created_at=timezone.make_aware(datetime.combine(meeting.date, datetime.min.time()))
                )
                total_fines += 1

print(f"   ✅ Saving transactions: {total_savings}")
print(f"   ✅ Fine payments: {total_fines}")

# ─── STEP 5: Create Loans ────────────────────────────────
print("\n[5/6] Creating loan history (4 paid + 1 active)...")

PAID_LOANS = [
    # (user_index, principal, purpose, start_month_offset, duration_months)
    (2, Decimal("5000"),  "Grocery shop inventory",  10, 4),   # Hari - Month 2, paid by Month 6
    (3, Decimal("8000"),  "Children's school fees",   8, 3),   # Gita - Month 4, paid by Month 7
    (5, Decimal("3000"),  "Medical emergency",        6, 2),   # Sarita - Month 6, paid by Month 8
    (7, Decimal("10000"), "House renovation",         4, 3),   # Anita - Month 8, paid by Month 11
]

for user_idx, principal, purpose, start_offset, duration in PAID_LOANS:
    borrower = users[user_idx]
    start_date = today - relativedelta(months=start_offset)
    end_date = start_date + relativedelta(months=duration)
    monthly_repayment = principal / duration
    interest_per_month = (principal * INTEREST_RATE) / 100
    total_interest = interest_per_month * duration

    loan = Loan.objects.create(
        samuha=samuha,
        user=borrower,
        principal_amount=principal,
        interest_rate=INTEREST_RATE,
        remaining_principal=Decimal("0.00"),  # Fully paid
        total_interest_paid=total_interest,
        purpose=purpose,
        status=Loan.STATUS_PAID,
        annual_income=Decimal("360000"),
        dti_ratio=Decimal("15.00"),
        employment_length=3,
        loan_term_months=duration,
    )
    # Backdate loan dates
    Loan.objects.filter(pk=loan.pk).update(
        applied_date=start_date,
        approved_date=start_date + timedelta(days=1),
        disbursed_date=start_date + timedelta(days=2),
        closed_date=end_date,
    )

    # Record disbursement transaction
    disb_txn = Transaction.objects.create(
        samuha=samuha, user=borrower,
        type=Transaction.TYPE_LOAN_DISBURSEMENT,
        amount=principal,
        description=f"Loan Disbursement: {borrower.full_name} - {purpose}",
    )
    Transaction.objects.filter(pk=disb_txn.pk).update(
        date=start_date + timedelta(days=2),
        created_at=timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
    )

    # Record repayment transactions (one per month)
    for m in range(duration):
        repay_date = start_date + relativedelta(months=m+1)
        
        # Principal repayment
        rep_txn = Transaction.objects.create(
            samuha=samuha, user=borrower,
            type=Transaction.TYPE_LOAN_REPAYMENT,
            amount=monthly_repayment,
            description=f"Loan Repayment {m+1}/{duration} - {borrower.full_name}",
        )
        Transaction.objects.filter(pk=rep_txn.pk).update(
            date=repay_date,
            created_at=timezone.make_aware(datetime.combine(repay_date, datetime.min.time()))
        )
        
        # Interest payment
        int_txn = Transaction.objects.create(
            samuha=samuha, user=borrower,
            type=Transaction.TYPE_INTEREST,
            amount=interest_per_month,
            description=f"Interest Payment {m+1}/{duration} - {borrower.full_name}",
        )
        Transaction.objects.filter(pk=int_txn.pk).update(
            date=repay_date,
            created_at=timezone.make_aware(datetime.combine(repay_date, datetime.min.time()))
        )

    print(f"   ✅ PAID Loan: {borrower.full_name} - NPR {principal} ({purpose})")

# Active loan - Deepak Magar (index 6)
active_borrower = users[6]
active_principal = Decimal("15000")
active_start = today - relativedelta(months=1)
active_remaining = active_principal  # No repayments yet

active_loan = Loan.objects.create(
    samuha=samuha,
    user=active_borrower,
    principal_amount=active_principal,
    interest_rate=INTEREST_RATE,
    remaining_principal=active_remaining,
    total_interest_paid=Decimal("0.00"),
    purpose="Business expansion - poultry farm",
    status=Loan.STATUS_ACTIVE,
    annual_income=Decimal("480000"),
    dti_ratio=Decimal("20.00"),
    employment_length=5,
    loan_term_months=12,
)
Loan.objects.filter(pk=active_loan.pk).update(
    applied_date=active_start,
    approved_date=active_start + timedelta(days=1),
    disbursed_date=active_start + timedelta(days=2),
    interest_last_calculated=active_start + timedelta(days=2),
)

disb_txn = Transaction.objects.create(
    samuha=samuha, user=active_borrower,
    type=Transaction.TYPE_LOAN_DISBURSEMENT,
    amount=active_principal,
    description=f"Loan Disbursement: {active_borrower.full_name} - Business expansion",
)
Transaction.objects.filter(pk=disb_txn.pk).update(
    date=active_start + timedelta(days=2),
    created_at=timezone.make_aware(datetime.combine(active_start, datetime.min.time()))
)

print(f"   ✅ ACTIVE Loan: {active_borrower.full_name} - NPR {active_principal} (Business expansion)")

# ─── STEP 6: Verification ────────────────────────────────
print("\n[6/6] Verification...")
member_count = Membership.objects.filter(samuha=samuha, status="active").count()
meeting_count = Meeting.objects.filter(samuha=samuha).count()
saving_count = Transaction.objects.filter(samuha=samuha, type="saving").count()
paid_loans = Loan.objects.filter(samuha=samuha, status="paid").count()
active_loans = Loan.objects.filter(samuha=samuha, status="active").count()

print(f"   Members:       {member_count}")
print(f"   Meetings:      {meeting_count}")
print(f"   Savings Txns:  {saving_count}")
print(f"   Paid Loans:    {paid_loans}")
print(f"   Active Loans:  {active_loans}")

print("\n" + "=" * 60)
print("  ✅ SEEDING COMPLETE!")
print("=" * 60)
print(f"\n  Samuha Code:  {samuha.samuha_code}")
print(f"  Password:     {PASSWORD}")
print(f"\n  LOGIN CREDENTIALS:")
print(f"  {'─' * 50}")
print(f"  {'Phone':<15} {'Name':<25} {'Role':<15}")
print(f"  {'─' * 50}")
for phone, fname, lname, role, _ in MEMBERS_DATA:
    print(f"  {phone:<15} {fname + ' ' + lname:<25} {role:<15}")
print(f"  {'─' * 50}")
print(f"  Password for ALL: {PASSWORD}")
print("=" * 60)
