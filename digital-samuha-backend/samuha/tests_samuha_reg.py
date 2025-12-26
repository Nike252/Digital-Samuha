from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Samuha, Membership

User = get_user_model()

class SamuhaRegistrationTests(APITestCase):
    def setUp(self):
        # Create a superuser for UT-07
        self.admin_user = User.objects.create_superuser(
            phone="9800000001",
            password="adminpassword"
        )

    def test_ut05_register_samuha_success(self):
        """
        UT-05: Submit valid Samuha details to /api/samuha/register/
        """
        url = reverse('samuha-register')
        data = {
            "samuha_name": "Test Samuha",
            "province": "Bagmati",
            "district": "Kathmandu",
            "municipality": "Kathmandu",
            "ward_number": "10",
            "adhakshya_full_name": "John Doe",
            "adhakshya_phone": "9800000000",
            "adhakshya_email": "john@example.com"
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        samuha = Samuha.objects.get(samuha_name="Test Samuha")
        # Should be pending initially
        self.assertEqual(samuha.status, Samuha.STATUS_PENDING)

    def test_ut06_register_samuha_missing_name(self):
        """
        UT-06: Submit registration with a missing 'Samuha Name'
        """
        url = reverse('samuha-register')
        data = {
            "province": "Bagmati",
            "district": "Kathmandu",
            "municipality": "Kathmandu",
            "ward_number": "10",
            "adhakshya_full_name": "John Doe",
            "adhakshya_phone": "9800000000",
            "adhakshya_email": "john@example.com"
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('samuha_name', response.data)

    def test_ut07_admin_approve_samuha(self):
        """
        UT-07: Super Admin approves a pending Samuha request
        """
        # 1. Create a pending Samuha (code is generated on save if blank)
        # To strictly test the "Code is generated" part, we can clear it or check it's generated on first save
        samuha = Samuha.objects.create(
            samuha_name="Pending Samuha",
            province="Bagmati",
            district="Kathmandu",
            municipality="Kathmandu",
            ward_number="1",
            adhakshya_full_name="Admin Admin",
            adhakshya_phone="9800000002",
            adhakshya_email="admin@admin.com",
            status=Samuha.STATUS_PENDING
        )
        # Note: Our model generates code on first save. 
        # For the test scenario, we ensure it transitions to ACTIVE and has a code.
        
        # 2. Login as Super Admin
        self.client.force_authenticate(user=self.admin_user)
        
        # 3. Approve the Samuha
        url = reverse('samuha-approve', kwargs={'pk': samuha.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Verify status and code
        samuha.refresh_from_db()
        self.assertEqual(samuha.status, Samuha.STATUS_ACTIVE)
        self.assertTrue(samuha.samuha_code.startswith("SMH-"))
