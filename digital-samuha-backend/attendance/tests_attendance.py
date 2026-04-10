from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
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
        
        # Verify transaction created in ledger
        self.assertTrue(Transaction.objects.filter(user=self.member, type='fine', amount=50.00).exists())

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
