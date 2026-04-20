import os
import django
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_samuha.settings')
django.setup()

from django.contrib.auth import get_user_model
from samuha.models import Samuha, Membership
from ledger.models import Transaction, Loan
from ledger.services import record_member_contribution, process_loan_repayment, disburse_loan_funds
from attendance.models import Meeting

User = get_user_model()

def create_mega_test_case():
    samuha_name = "Mega Test Samuha (10 Members)"
    print(f"Creating {samuha_name}...")
    
    samuha, _ = Samuha.objects.get_or_create(
        samuha_name=samuha_name,
        defaults={
            'loan_interest_rate': Decimal('14.00'),
            'saving_amount': Decimal('1000.00'),
            'adhakshya_full_name': 'Mega Admin',
            'adhakshya_phone': '9000000000',
            'adhakshya_email': 'admin@mega.com',
            'province': 'Bagmati',
            'district': 'Kathmandu',
            'municipality': 'Kathmandu',
            'ward_number': '1',
            'status': Samuha.STATUS_ACTIVE
        }
    )

    # 1. Create 10 Users
    users = []
    for i in range(10):
        phone = f"900000000{i}"
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={
                'first_name': f'Member',
                'last_name': f'Alpha-{i}',
            }
        )
        if created:
            user.set_password("password123")
            user.save()
        users.append(user)

    # 2. Setup Memberships
    memberships = []
    for i, user in enumerate(users):
        role = Membership.ROLE_MEMBER
        if i == 0: role = Membership.ROLE_ADHAKSHYA
        elif i == 1: role = Membership.ROLE_CO_ADHAKSHYA
        
        mem, _ = Membership.objects.get_or_create(
            user=user, samuha=samuha,
            defaults={'role': role, 'status': Membership.STATUS_ACTIVE, 'is_approved': True}
        )
        memberships.append(mem)

    # 3. Record 12 Months of Savings
    print("Recording 12 months of savings for 10 members...")
    for m_idx in range(12):
        meeting_date = timezone.now().date() - timedelta(days=30 * (12 - m_idx))
        meeting, _ = Meeting.objects.get_or_create(samuha=samuha, date=meeting_date, defaults={'status': 'completed'})
        
        savings_data = []
        for u in users:
            savings_data.append({
                'user_id': u.id,
                'saving_amount': 1000,
                'is_paid': True
            })
        record_member_contribution(samuha, users[0], savings_data, meeting)

    # 4. Simulate 7 Paid Loans (To generate profit pool)
    print("Simulating 7 paid loans...")
    for i in range(2, 9): # Users 2 through 8
        u = users[i]
        loan = Loan.objects.create(
            samuha=samuha, user=u, 
            principal_amount=Decimal('5000.00'),
            interest_rate=Decimal('14.00'),
            remaining_principal=Decimal('5000.00'),
            status=Loan.STATUS_APPROVED,
            purpose=f"Test Paid Loan {i}"
        )
        # Disburse
        disburse_loan_funds(loan.id, users[0])
        # Repay fully + some interest
        # Total interest approx 1 month = 5000 * 0.14 = 700
        process_loan_repayment(loan.id, Decimal('5700.00'))
        print(f" - Loan for {u.first_name} {u.last_name} settled.")

    # 5. Create 1 Active Loan (To test the blocking guard)
    print("Creating 1 active loan for Member 9...")
    active_loan = Loan.objects.create(
        samuha=samuha, user=users[9],
        principal_amount=Decimal('2000.00'),
        interest_rate=Decimal('14.00'),
        remaining_principal=Decimal('2000.00'),
        status=Loan.STATUS_APPROVED,
        purpose="The Active Loan Guard Test"
    )
    disburse_loan_funds(active_loan.id, users[0])

    print("\n" + "="*40)
    print("MEGA TEST CASE CREATED SUCCESSFULLY")
    print("="*40)
    print(f"Samuha: {samuha_name}")
    print(f"Adhakshya Login: 9000000000 / password123")
    print(f"Co-Adhakshya Login: 9000000001 / password123")
    print(f"Member Login: 9000000009 / password123 (Has active loan)")
    print("="*40)

if __name__ == "__main__":
    create_mega_test_case()
