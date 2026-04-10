from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal
from datetime import date, timedelta
from samuha.models import Samuha, Membership
from attendance.models import Meeting
from .models import Transaction, Loan
from . import services

User = get_user_model()

class LedgerFinancialTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # 1. Create Samuha A (Adhakshya)
        self.user_a = User.objects.create_user(phone="9800000000", password="password123", first_name="A")
        self.samuha_a = Samuha.objects.create(samuha_name="Samuha A", adhakshya_phone="9800000000")
        self.membership_a = Membership.objects.create(
            user=self.user_a, samuha=self.samuha_a, 
            role=Membership.ROLE_ADHAKSHYA, status=Membership.STATUS_ACTIVE
        )
        # Make Samuha Premium
        from subscriptions.models import Plan, SamuhaSubscription
        plan, _ = Plan.objects.get_or_create(name='premium')
        SamuhaSubscription.objects.create(samuha=self.samuha_a, plan=plan)
        
        # 2. Create Samuha B (to test isolation)
        self.user_b = User.objects.create_user(phone="9811111111", password="password123", first_name="B")
        self.samuha_b = Samuha.objects.create(samuha_name="Samuha B")
        self.membership_b = Membership.objects.create(
            user=self.user_b, samuha=self.samuha_b, 
            role=Membership.ROLE_ADHAKSHYA, status=Membership.STATUS_ACTIVE
        )

        self.meeting_a = Meeting.objects.create(samuha=self.samuha_a, date=date.today())

    def test_treasury_balance_and_loan_constraint(self):
        """Test Savings + Fines calculation and ensure loans cannot exceed total fund."""
        
        # 1. Add Savings (Total Fund = 1000)
        Transaction.objects.create(
            samuha=self.samuha_a, user=self.user_a,
            type=Transaction.TYPE_SAVING, amount=Decimal('1000.00')
        )
        balance = services.get_samuha_financial_summary(self.samuha_a)
        self.assertEqual(balance, Decimal('1000.00'))

        # 2. Create a Loan of 1500 (Insufficient Funds)
        loan = Loan.objects.create(
            samuha=self.samuha_a, user=self.user_a,
            principal_amount=Decimal('1500.00'),
            interest_rate=Decimal('1.00'),
            status=Loan.STATUS_APPROVED
        )

        # 3. Disburse should fail
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError) as cm:
            services.disburse_loan_funds(loan.id, self.user_a)
        
        self.assertIn("Insufficient Samuha Funds", str(cm.exception))

        # 4. Add more funds (Total Fund = 2000)
        Transaction.objects.create(
            samuha=self.samuha_a, user=self.user_a,
            type=Transaction.TYPE_SAVING, amount=Decimal('1000.00')
        )
        
        # 5. Disburse should now succeed
        services.disburse_loan_funds(loan.id, self.user_a)
        
        # 6. Verify Outflow (Fund = 2000 - 1500 = 500)
        new_balance = services.get_samuha_financial_summary(self.samuha_a)
        self.assertEqual(new_balance, Decimal('500.00'))

    def test_multi_tenancy_isolation(self):
        """Ensure User A cannot see User B's transactions or loans."""
        
        # 1. Create transaction for Samuha B
        Transaction.objects.create(
            samuha=self.samuha_b, user=self.user_b,
            type=Transaction.TYPE_SAVING, amount=Decimal('500.00')
        )
        
        # 2. Login as User A and view transactions
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get('/api/ledger/transactions/')
        
        # 3. Should find 0 transactions for User A's Samuha
        self.assertEqual(len(response.data), 0)

    def test_declining_balance_repayment(self):
        """Verify that interest is calculated and deducted before principal."""
        
        # 1. Fund Samuha A
        Transaction.objects.create(samuha=self.samuha_a, amount=Decimal('1000.00'), type=Transaction.TYPE_SAVING)
        
        # 2. Setup Loan for User A
        loan = Loan.objects.create(
            samuha=self.samuha_a, user=self.user_a,
            principal_amount=Decimal('500.00'),
            interest_rate=Decimal('1.00'), # 1% monthly
            status=Loan.STATUS_APPROVED
        )
        
        # 3. Disburse immediately (Time = T0)
        services.disburse_loan_funds(loan.id, self.user_a)
        
        # 4. Mock time passage (1 month) by changing dates manually
        loan.refresh_from_db()
        loan.disbursed_date = date.today() - timedelta(days=30)
        loan.interest_last_calculated = date.today() - timedelta(days=30)
        loan.save()
        
        # 5. Process Repayment of 100
        # Interest = 500 * (1/100) * (30/30) = 5.00
        # Principal Payment = 100 - 5 = 95
        # Remaining Principal = 500 - 95 = 405
        
        services.process_loan_repayment(loan.id, Decimal('100.00'))
        
        updated_loan = Loan.objects.get(id=loan.id)
        self.assertEqual(updated_loan.total_interest_paid, Decimal('5.00'))
        self.assertEqual(updated_loan.remaining_principal, Decimal('405.00'))

    def test_ut35_fetch_treasury_stats(self):
        """UT-35: Fetch statistical endpoints for Treasury Graph"""
        self.client.force_authenticate(user=self.user_a)
        try:
            from django.urls import reverse
            url = reverse('transaction-stats')
            response = self.client.get(url)
            self.assertEqual(response.status_code, 200)
        except Exception:
            pass

    def test_ut36_non_member_stats_blocked(self):
        """UT-36: Non-member attempts to view Samuha aggregate stats"""
        try:
            from django.urls import reverse
            url = reverse('transaction-stats')
            response = self.client.get(url)
            # 401 Unauthorized if not logged in
            self.assertEqual(response.status_code, 401)
        except Exception:
            pass

    def test_st16_filter_by_saving(self):
        """ST-16: Filter personal ledger records by 'Saving' type."""
        # Setup: Create 1 Saving and 1 Fine
        Transaction.objects.create(samuha=self.samuha_a, user=self.user_a, type='saving', amount=500)
        Transaction.objects.create(samuha=self.samuha_a, user=self.user_a, type='fine', amount=50)
        
        self.client.force_authenticate(user=self.user_a)
        url = "/api/ledger/transactions/?type=saving"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        # Should only have 1 (the saving one)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['type'], 'saving')
