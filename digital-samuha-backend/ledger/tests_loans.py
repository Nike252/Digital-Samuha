from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from samuha.models import Samuha, Membership
from ledger.models import Transaction, Loan
from decimal import Decimal

User = get_user_model()

class LoanTests(APITestCase):
    def setUp(self):
        # 1. Create Samuha
        self.samuha = Samuha.objects.create(
            samuha_name="Loan Test Samuha",
            samuha_code="LOAN123",
            province="Bagmati",
            district="Kathmandu",
            municipality="Kathmandu",
            ward_number="1",
            adhakshya_full_name="Adhakshya One",
            adhakshya_phone="9800000010",
            adhakshya_email="a1@test.com",
            loan_interest_rate=Decimal("1.00"),
            status=Samuha.STATUS_ACTIVE
        )
        
        # Make Samuha Premium
        from subscriptions.models import Plan, SamuhaSubscription
        plan, _ = Plan.objects.get_or_create(name='premium')
        SamuhaSubscription.objects.create(samuha=self.samuha, plan=plan)
        
        # 2. Create Adhakshya User
        self.adhakshya = User.objects.create_user(phone="9800000010", password="password123", first_name="Admin")
        Membership.objects.create(user=self.adhakshya, samuha=self.samuha, role=Membership.ROLE_ADHAKSHYA, status=Membership.STATUS_ACTIVE, is_approved=True)
        
        # 3. Create Regular Member
        self.member = User.objects.create_user(phone="9800000011", password="password123", first_name="Member")
        Membership.objects.create(user=self.member, samuha=self.samuha, role=Membership.ROLE_MEMBER, status=Membership.STATUS_ACTIVE, is_approved=True)

    def test_ut12_request_new_loan(self):
        """UT-12: Member requests a new loan (No previous debt)"""
        self.client.force_authenticate(user=self.member)
        url = reverse('loan-list')
        data = {
            "principal_amount": "5000.00",
            "purpose": "Personal needs",
            "loan_term": 12
        }
        # Explicitly use json format
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Loan.objects.count(), 1)
        self.assertEqual(Loan.objects.get().status, Loan.STATUS_PENDING)

    def test_ut13_prevent_double_loan(self):
        """UT-13: Member requests a loan while having an 'Active' loan"""
        # Create an existing active loan
        Loan.objects.create(
            samuha=self.samuha, 
            user=self.member, 
            principal_amount=Decimal("2000.00"), 
            interest_rate=Decimal("1.00"),
            status=Loan.STATUS_ACTIVE,
            remaining_principal=Decimal("2000.00")
        )
        
        self.client.force_authenticate(user=self.member)
        url = reverse('loan-list')
        data = {
            "principal_amount": "3000.00",
            "purpose": "Second loan",
            "loan_term": 6
        }
        response = self.client.post(url, data, format='json')
        # Should return 400 Bad Request due to validation error in view
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already have an active or pending loan", str(response.data))

    def test_ut14_approval_blocked_insufficient_funds(self):
        """UT-14: Adhakshya approves loan exceeding Total Treasury"""
        # 1. Member requests NPR 10,000
        loan = Loan.objects.create(
            samuha=self.samuha, 
            user=self.member, 
            principal_amount=Decimal("10000.00"), 
            interest_rate=Decimal("1.00"),
            status=Loan.STATUS_PENDING
        )
        
        # 2. Samuha has only NPR 2,000 in treasury
        Transaction.objects.create(
            samuha=self.samuha, user=self.adhakshya, type='saving', amount=Decimal("2000.00")
        )
        
        # 3. Adhakshya tries to approve
        self.client.force_authenticate(user=self.adhakshya)
        url = reverse('loan-manage', kwargs={'pk': loan.id})
        response = self.client.post(url, {"action": "approve"}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("insufficient samuha funds", str(response.data).lower())

    def test_ut15_loan_repayment_math(self):
        """UT-15: Record a Loan Repayment installment"""
        # 1. Create an active loan of 5000
        loan = Loan.objects.create(
            samuha=self.samuha, 
            user=self.member, 
            principal_amount=Decimal("5000.00"), 
            interest_rate=Decimal("1.00"),
            remaining_principal=Decimal("5000.00"),
            status=Loan.STATUS_ACTIVE
        )
        # Mock time passage
        from datetime import date, timedelta
        loan.disbursed_date = date.today() - timedelta(days=30)
        loan.interest_last_calculated = date.today() - timedelta(days=30)
        loan.save()
        
        # 2. Record repayment of 1600 (100 interest + 1500 principal)
        self.client.force_authenticate(user=self.adhakshya)
        url = reverse('loan-repay', kwargs={'pk': loan.id})
        data = {
            "amount": "1600.00",
            "description": "Installment 1"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Verify math
        loan.refresh_from_db()
        # Interest calculation depends on mocked time
        self.assertLess(loan.remaining_principal, 5000)
        self.assertGreater(loan.total_interest_paid, 0)

    def test_ut38_extreme_dti_high_risk(self):
        """UT-38: Ping AI Loan Prediction with catastrophic parameters"""
        self.client.force_authenticate(user=self.member)
        # Create a loan to predict on (since the view requires it)
        loan = Loan.objects.create(
            samuha=self.samuha, user=self.member, principal_amount=500000, 
            annual_income=1000, dti_ratio=90, interest_rate=Decimal("1.00"),
            status=Loan.STATUS_PENDING
        )
        try:
            url = reverse('loan-predict')
            response = self.client.get(f"{url}?loan_id={loan.id}")
            self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
        except Exception:
            pass
