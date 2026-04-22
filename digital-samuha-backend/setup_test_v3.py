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

def create_elite_test_case():
    samuha_name = "Elite 15-Member Samuha"
    print(f"Creating {samuha_name}...")
    
    samuha, _ = Samuha.objects.get_or_create(
        samuha_name=samuha_name,
        defaults={
            'loan_interest_rate': Decimal('15.00'),
            'saving_amount': Decimal('2000.00'),
            'adhakshya_full_name': 'Elite Admin',
            'adhakshya_phone': '9100000000',
            'status': Samuha.STATUS_ACTIVE
        }
    )

    # 1. Create 15 Users (9100000000 to 9100000014)
    users = []
    for i in range(15):
        phone = f"91000000{str(i).zfill(2)}"
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={
                'first_name': f'Member',
                'last_name': f'V3-{i}',
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

    # 3. Record 6 Months of Savings
    print("Recording 6 months of savings for 15 members...")
    for m_idx in range(6):
        meeting_date = timezone.now().date() - timedelta(days=30 * (6 - m_idx))
        meeting, _ = Meeting.objects.get_or_create(samuha=samuha, date=meeting_date, defaults={'status': 'completed'})
        
        savings_data = []
        for u in users:
            savings_data.append({
                'user_id': u.id,
                'saving_amount': 2000,
                'is_paid': True
            })
        record_member_contribution(samuha, users[0], savings_data, meeting)

    # 4. Simulate a few settled loans for interest profit
    print("Simulating interest profit...")
    for i in range(2, 6): # Users 2 through 5
        u = users[i]
        loan = Loan.objects.create(
            samuha=samuha, user=u, 
            principal_amount=Decimal('10000.00'),
            interest_rate=Decimal('15.00'),
            remaining_principal=Decimal('10000.00'),
            status=Loan.STATUS_APPROVED,
            purpose=f"Investment Loan {i}"
        )
        disburse_loan_funds(loan.id, users[0])
        process_loan_repayment(loan.id, Decimal('11500.00')) # Repaid with 1500 interest

    print("\n" + "="*40)
    print("ELITE TEST CASE CREATED SUCCESSFULLY")
    print("="*40)
    print(f"Samuha: {samuha_name}")
    print(f"Adhakshya Login: 9100000000 / password123")
    print(f"Co-Adhakshya Login: 9100000001 / password123")
    print(f"Base Members: 9100000002 to 9100000014")
    print("="*40)

if __name__ == "__main__":
    create_elite_test_case()
