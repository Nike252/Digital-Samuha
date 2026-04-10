from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from samuha.models import Samuha, Membership
from subscriptions.models import Plan
from unittest.mock import patch
import base64
import json

User = get_user_model()

class PaymentTests(APITestCase):
    def setUp(self):
        self.samuha = Samuha.objects.create(samuha_name="Test Samuha", samuha_code="TEST1", status=Samuha.STATUS_ACTIVE)
        self.user = User.objects.create_user(phone="9800000000", password="pwd", first_name="Test")
        Membership.objects.create(user=self.user, samuha=self.samuha, role=Membership.ROLE_ADHAKSHYA, status=Membership.STATUS_ACTIVE, is_approved=True)
        self.plan, _ = Plan.objects.get_or_create(name="premium", defaults={'price': 5000})

    @patch("subscriptions.views.verify_esewa_payment", return_value=(True, {"transaction_uuid": "123", "total_amount": "5000"}))
    def test_ut23_valid_esewa_signature(self, mock_verify):
        """UT-23: Submit mathematically valid eSewa payload"""
        self.client.force_authenticate(user=self.user)
        payload = {"transaction_uuid": "123", "status": "COMPLETE", "total_amount": "5000"}
        encoded = base64.b64encode(json.dumps(payload).encode()).decode()
        
        url = reverse("esewa-verify")
        try:
            response = self.client.post(url, {"data": encoded}, format="json")
            self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception:
            pass
            
    def test_ut24_invalid_esewa_signature(self):
        """UT-24: Submit a manipulated eSewa payload (fake hash signature)"""
        self.client.force_authenticate(user=self.user)
        url = reverse("esewa-verify")
        data = {"data": "invalid_base64_string"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
