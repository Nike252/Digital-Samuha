from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from samuha.models import Samuha, Membership

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        # Create a test Samuha with correct fields
        self.samuha = Samuha.objects.create(
            samuha_name="Test Samuha",
            samuha_code="TEST1234",
            province="Bagmati",
            district="Kathmandu",
            municipality="Kathmandu",
            ward_number="32",
            adhakshya_full_name="Test Adhakshya",
            adhakshya_phone="9800000001",
            adhakshya_email="adhakshya@test.com",
            status=Samuha.STATUS_ACTIVE
        )
        
        # Create a test user
        self.user_password = "testpassword123"
        self.user = User.objects.create_user(
            phone="9800000000",
            password=self.user_password,
            first_name="Test",
            last_name="User"
        )
        # Create a regular membership
        self.membership = Membership.objects.create(
            user=self.user,
            samuha=self.samuha,
            role=Membership.ROLE_MEMBER,
            status=Membership.STATUS_ACTIVE,
            is_approved=True
        )

    def test_ut01_login_valid(self):
        """UT-01: Login with valid phone and password"""
        url = reverse('auth-login')
        data = {'phone': '9800000000', 'password': self.user_password}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_ut02_login_invalid_password(self):
        """UT-02: Login with invalid password"""
        url = reverse('auth-login')
        data = {'phone': '9800000000', 'password': 'wrongpassword'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_ut03_signup_invalid_samuha_code(self):
        """UT-03: Signup with an invalid/fake Samuha Code"""
        url = reverse('auth-signup')
        data = {
            'phone': '9811111111',
            'password': 'newpassword123',
            'first_name': 'New',
            'last_name': 'User',
            'email': 'new@test.com',
            'samuha_code': 'INVALID999'
        }
        response = self.client.post(url, data)
        # According to logic, an invalid code should return 400
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ut04_rbac_member_access_admin_endpoint(self):
        """UT-04: Regular Member attempts to access Super Admin endpoint"""
        # First login as a member to get token
        self.client.force_authenticate(user=self.user)
        
        # Try to access the samuha-list endpoint (restricted to superusers)
        url = reverse('samuha-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ut29_expired_token_fails(self):
        """UT-29: Try accessing an API route with an expired Access Token"""
        from rest_framework_simplejwt.tokens import AccessToken
        from datetime import timedelta
        
        token = AccessToken.for_user(self.user)
        token.set_exp(lifetime=timedelta(seconds=-1)) # Expire it instantly
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + str(token))
        url = reverse('auth-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_ut30_refresh_token_succeeds(self):
        """UT-30: Send a valid Refresh Token to get a fresh Access Token"""
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(self.user)
        
        url = reverse('auth-token-refresh')
        response = self.client.post(url, {'refresh': str(refresh)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_ut31_update_duplicate_phone(self):
        """UT-31: User updates their phone number to one already in use"""
        # Create another user to cause duplication
        User.objects.create_user(phone="9899999999", password="pwd", first_name="Other", last_name="Guy")
        
        self.client.force_authenticate(user=self.user)
        url = reverse('auth-me')
        data = {
            'phone': '9899999999',
            'current_password': self.user_password
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_ut32_update_with_wrong_password(self):
        """UT-32: User attempts to change password with incorrect current_password"""
        self.client.force_authenticate(user=self.user)
        url = reverse('auth-me')
        data = {
            'new_password': 'newpassword123',
            'confirm_new_password': 'newpassword123',
            'current_password': 'wrong_password_here'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
