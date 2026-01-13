from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from samuha.models import Samuha, Membership
from ledger.models import Transaction
from decimal import Decimal

User = get_user_model()

class AIBotTests(APITestCase):
    def setUp(self):
        # 1. Create Samuha
        self.samuha = Samuha.objects.create(
            samuha_name="AI Test Samuha",
            samuha_code="AI123",
            province="Bagmati",
            district="Kathmandu",
            municipality="Kathmandu",
            ward_number="1",
            adhakshya_full_name="Adhakshya One",
            adhakshya_phone="9800000040",
            adhakshya_email="a4@test.com",
            status=Samuha.STATUS_ACTIVE
        )
        
        # 2. Create Member
        self.member = User.objects.create_user(phone="9800000041", password="password123")
        Membership.objects.create(user=self.member, samuha=self.samuha, role=Membership.ROLE_MEMBER, status=Membership.STATUS_ACTIVE, is_approved=True)

        # 3. Add some financial data for the context to pick up
        Transaction.objects.create(
            samuha=self.samuha, 
            user=self.member, 
            type=Transaction.TYPE_SAVING, 
            amount=Decimal("1500.00")
        )

    def test_ut21_ai_query_with_context(self):
        """UT-21: Member submits a financial query (triggers rule-based fallback with context)"""
        self.client.force_authenticate(user=self.member)
        url = reverse('samuha-ai')
        # Use a keyword that the rule-based assistant recognizes: 'saving'
        data = {"prompt": "What are our total savings?"}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify that the DB context (1500) was injected into the response
        # Using a more robust check that handles potential formatting (commas)
        response_text = str(response.data['response']).replace(',', '')
        self.assertIn("1500", response_text)
        self.assertIn("total savings", str(response.data['response']).lower())

    def test_ut22_empty_prompt_fails(self):
        """UT-22: Submit an empty chat prompt"""
        self.client.force_authenticate(user=self.member)
        url = reverse('samuha-ai')
        data = {"prompt": ""}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Prompt is required", str(response.data))
