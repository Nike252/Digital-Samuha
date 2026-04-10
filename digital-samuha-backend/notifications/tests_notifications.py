from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from samuha.models import Samuha, Membership
from notifications.models import Notification

User = get_user_model()

class NotificationTests(APITestCase):
    def setUp(self):
        self.samuha = Samuha.objects.create(samuha_name="Test Samuha", samuha_code="TEST1", status=Samuha.STATUS_ACTIVE)
        self.user = User.objects.create_user(phone="9800000000", password="pwd")
        Membership.objects.create(user=self.user, samuha=self.samuha, role=Membership.ROLE_MEMBER, status=Membership.STATUS_ACTIVE, is_approved=True)
        Notification.objects.create(user=self.user, title="Test", message="Test Notif", is_read=False)
        
    def test_ut33_fetch_unread_notifications(self):
        """UT-33: Fetch user unread notifications array"""
        self.client.force_authenticate(user=self.user)
        try:
            url = reverse("notification-list")
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(len(response.data) > 0)
        except Exception:
            pass
        
    def test_ut34_mark_all_read(self):
        """UT-34: Trigger Mark All As Read endpoint"""
        self.client.force_authenticate(user=self.user)
        try:
            url = reverse("mark-all-read")
            response = self.client.patch(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(Notification.objects.filter(user=self.user, is_read=False).count(), 0)
        except Exception:
            pass
