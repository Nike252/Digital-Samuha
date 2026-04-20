from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from samuha.models import Samuha, Membership
from attendance.models import Meeting, Attendance
from ledger.models import Transaction
from decimal import Decimal

User = get_user_model()

class AttendanceTests(APITestCase):
    def setUp(self):
        # 1. Create Samuha
        self.samuha = Samuha.objects.create(
            samuha_name="Attendance Test Samuha",
            samuha_code="ATTD123",
            province="Bagmati",
            district="Kathmandu",
            municipality="Kathmandu",
            ward_number="1",
            adhakshya_full_name="Adhakshya One",
            adhakshya_phone="9800000020",
            adhakshya_email="a2@test.com",
            absent_fine=Decimal("50.00"),
            status=Samuha.STATUS_ACTIVE
        )
        
        # 2. Create Adhakshya User
        self.adhakshya = User.objects.create_user(phone="9800000020", password="password123")
        Membership.objects.create(user=self.adhakshya, samuha=self.samuha, role=Membership.ROLE_ADHAKSHYA, status=Membership.STATUS_ACTIVE, is_approved=True)
        
        # 3. Create Regular Member
        self.member = User.objects.create_user(phone="9800000021", password="password123")
        Membership.objects.create(user=self.member, samuha=self.samuha, role=Membership.ROLE_MEMBER, status=Membership.STATUS_ACTIVE, is_approved=True)

    def test_ut16_schedule_meeting(self):
        """UT-16: Adhakshya schedules a new meeting date"""
        self.client.force_authenticate(user=self.adhakshya)
        url = reverse('meeting-list')
        data = {
            "title": "Monthly Meeting UT-16",
            "date": "2026-04-15",
            "start_time": "11:00:00"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Meeting.objects.count(), 1)

    def test_ut17_mark_present(self):
        """UT-17: Mark a member as 'Present'"""
        meeting = Meeting.objects.create(samuha=self.samuha, date="2026-03-22", title="Test Meeting")
        self.client.force_authenticate(user=self.adhakshya)
        
        # Using AttendanceBatchUpdateView logic for UT-17/18
        # We need to GET the records first to get the IDs
        get_url = reverse('attendance-batch-update', kwargs={'meeting_id': meeting.id})
        get_response = self.client.get(get_url)
        attendance_records = get_response.data
        
        url = reverse('attendance-batch-update', kwargs={'meeting_id': meeting.id})
        data = {
            "attendance": [
                {"id": rec['id'], "status": "present"} for rec in attendance_records
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        att = Attendance.objects.get(meeting=meeting, user=self.member)
        self.assertEqual(att.status, Attendance.STATUS_PRESENT)
        self.assertEqual(float(att.fine_amount), 0.00)

    def test_ut18_mark_absent_auto_fine(self):
        """UT-18: Mark a member as 'Absent' (Auto-Fine Logic)"""
        meeting = Meeting.objects.create(samuha=self.samuha, date="2026-03-23", title="Test Meeting Absent")
        self.client.force_authenticate(user=self.adhakshya)
        
        # Get records to get IDs
        get_url = reverse('attendance-batch-update', kwargs={'meeting_id': meeting.id})
        get_response = self.client.get(get_url)
        attendance_records = get_response.data
        
        url = reverse('attendance-batch-update', kwargs={'meeting_id': meeting.id})
        # Set self.member to absent
        data = {
            "attendance": [
                {"id": rec['id'], "status": "present" if rec['user_details']['id'] == self.adhakshya.id else "absent"} 
                for rec in attendance_records
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        att = Attendance.objects.get(meeting=meeting, user=self.member)
        self.assertEqual(att.status, Attendance.STATUS_ABSENT)
        self.assertEqual(float(att.fine_amount), 50.00)
        
        # Verify that we check the right data (transaction is created during Batch Ledger update, not attendance marking)
        self.assertEqual(att.fine_amount, Decimal('50.00'))

    def test_ut37_restarts_ended_meeting_blocked(self):
        """UT-37: Admin attempts to delete a meeting with transactions (re-using meeting-detail delete)"""
        meeting = Meeting.objects.create(samuha=self.samuha, date="2026-03-24", title="Dead Meeting")
        # Add a transaction to block deletion
        Transaction.objects.create(samuha=self.samuha, user=self.member, meeting=meeting, type='saving', amount=500)
        
        self.client.force_authenticate(user=self.adhakshya)
        url = reverse('meeting-detail', kwargs={'pk': meeting.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("recorded financial transactions", str(response.data))

    def test_ut39_profit_distribution_safety(self):
        """UT-39: Adhakshya attempts to distribute funds while a loan is active (Blocked)"""
        # 1. Give member a loan
        from ledger.models import Loan
        loan = Loan.objects.create(
            samuha=self.samuha, user=self.member, 
            principal_amount=1000, remaining_principal=1000,
            interest_rate=2, status=Loan.STATUS_ACTIVE
        )
        
        self.client.force_authenticate(user=self.adhakshya)
        url = reverse('transaction-distribute-funds')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("active loans exist", str(response.data))

    def test_ut40_dissolution_payout_logic(self):
        """UT-40: Complete Samuha Dissolution with profit sharing"""
        # 1. Create fake profit (Fine transactions)
        Transaction.objects.create(samuha=self.samuha, type='fine', amount=100, description="Profit")
        Transaction.objects.create(samuha=self.samuha, type='fine', amount=100, description="Profit")
        
        # 2. Member has some savings
        Transaction.objects.create(samuha=self.samuha, user=self.member, type='saving', amount=500)
        
        # 3. Dissolve (No active loans now)
        self.client.force_authenticate(user=self.adhakshya)
        url = reverse('transaction-dissolve-samuha')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Verify Samuha is inactive
        self.samuha.refresh_from_db()
        self.assertEqual(self.samuha.status, 'inactive')
        
        # 5. Verify Member is exited
        membership = Membership.objects.get(user=self.member, samuha=self.samuha)
        self.assertEqual(membership.status, Membership.STATUS_EXITED)
        
        # 6. Verify Dividends created (200 profit / 2 members = 100 each)
        self.assertTrue(Transaction.objects.filter(user=self.member, type='distribution', amount=100).exists())
        # Verify Savings returned (500)
        self.assertTrue(Transaction.objects.filter(user=self.member, type='liquidation', amount=500).exists())

    def test_ut_41_payout_report_generation(self):
        """
        UT-41: Verify payout report API returns correct aggregates for multiple members.
        """
        # Create a second member
        second_user = User.objects.create_user(phone="9800000010", password="password123", first_name="Second", last_name="Member")
        Membership.objects.create(user=second_user, samuha=self.samuha, status=Membership.STATUS_ACTIVE, role=Membership.ROLE_MEMBER)
        
        # Current members in setUp are adhakshya and member. Total now = 3.
        from ledger.services import get_samuha_distribution_preview
        
        # Add 300 interest into the pool
        Transaction.objects.create(samuha=self.samuha, user=self.adhakshya, type=Transaction.TYPE_INTEREST, amount=Decimal('300.00'), date=timezone.now().date())
        
        report = get_samuha_distribution_preview(self.samuha)
        
        # 3 members, 300 profit = 100 each
        self.assertEqual(report['member_count'], 3)
        self.assertEqual(float(report['share_of_profit']), 100.00)

    def test_ut_42_distribution_archival_record(self):
        """
        UT-42: Verify that an Official Payout Record (PDF) is archived after distribution.
        """
        from ledger.services import execute_samuha_distribution
        from documents.models import Document
        
        initial_doc_count = Document.objects.filter(samuha=self.samuha, category='payout').count()
        
        # Execute distribution
        execute_samuha_distribution(self.samuha, self.adhakshya, is_dissolve=False)
        
        final_doc_count = Document.objects.filter(samuha=self.samuha, category='payout').count()
        self.assertEqual(final_doc_count, initial_doc_count + 1)
        
        latest_doc = Document.objects.filter(samuha=self.samuha, category='payout').latest('created_at')
        self.assertEqual(latest_doc.category, 'payout')
        self.assertTrue('Payout' in latest_doc.file.name)
