from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from samuha.models import Samuha, Membership
from decimal import Decimal

User = get_user_model()

class DocGenTests(APITestCase):
    def setUp(self):
        # 1. Create Samuha
        self.samuha = Samuha.objects.create(
            samuha_name="DocGen Test Samuha",
            samuha_code="DOC123",
            province="Bagmati",
            district="Kathmandu",
            municipality="Kathmandu",
            ward_number="1",
            adhakshya_full_name="Adhakshya One",
            adhakshya_phone="9800000030",
            adhakshya_email="a3@test.com",
            status=Samuha.STATUS_ACTIVE
        )
        
        # 2. Create Adhakshya User
        self.adhakshya = User.objects.create_user(phone="9800000030", password="password123")
        Membership.objects.create(user=self.adhakshya, samuha=self.samuha, role=Membership.ROLE_ADHAKSHYA, status=Membership.STATUS_ACTIVE, is_approved=True)

    def test_ut19_generate_ward_niwedan_success(self):
        """UT-19: Adhakshya requests Ward Niwedan (PDF)"""
        # Set citizenship no first
        self.samuha.adhakshya_citizenship_no = "12-34-56-789"
        self.samuha.save()
        
        self.client.force_authenticate(user=self.adhakshya)
        url = reverse('ward-niwedan')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue(len(response.content) > 100) # Check binary content

    def test_ut20_missing_citizenship_fails(self):
        """UT-20: Request PDF but Adhakshya profile is missing Citizenship No"""
        # Ensure citizenship no is empty
        self.samuha.adhakshya_citizenship_no = ""
        self.samuha.save()
        
        self.client.force_authenticate(user=self.adhakshya)
        url = reverse('ward-niwedan')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Citizenship Number is missing", str(response.data))
