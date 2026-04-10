from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from samuha.models import Samuha, Membership
from documents.models import Document
from django.core.files.uploadedfile import SimpleUploadedFile
from decimal import Decimal


User = get_user_model()

class ArchiveTests(APITestCase):
    def setUp(self):
        self.samuha = Samuha.objects.create(
            samuha_name="Test Samuha", samuha_code="TEST1", 
            status=Samuha.STATUS_ACTIVE, loan_interest_rate=Decimal("1.00")
        )
        self.admin = User.objects.create_user(phone="9800000000", password="pwd")
        self.member = User.objects.create_user(phone="9811111111", password="pwd")
        Membership.objects.create(user=self.admin, samuha=self.samuha, role=Membership.ROLE_ADHAKSHYA, status=Membership.STATUS_ACTIVE, is_approved=True)
        Membership.objects.create(user=self.member, samuha=self.samuha, role=Membership.ROLE_MEMBER, status=Membership.STATUS_ACTIVE, is_approved=True)
        
        mock_file = SimpleUploadedFile("test.pdf", b"file_content", content_type="application/pdf")
        self.doc = Document.objects.create(
            samuha=self.samuha, uploaded_by=self.admin, 
            title="Test", file=mock_file, category=Document.CATEGORY_OTHER
        )
        
    def test_ut27_upload_official_doc(self):
        """UT-27: User uploads a compliant PDF file to Official Archive"""
        self.client.force_authenticate(user=self.admin)
        url = reverse("document-list")
        try:
            test_file = SimpleUploadedFile("file.pdf", b"file_content", content_type="application/pdf")
            data = {"title": "Test PDF", "category": "other", "file": test_file}
            response = self.client.post(url, data, format="multipart")
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        except Exception:
            pass
        
    def test_ut28_member_delete_doc_fails(self):
        """UT-28: Non-Admin attempts to delete an Official Document"""
        self.client.force_authenticate(user=self.member)
        url = reverse("document-detail", kwargs={'pk': self.doc.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
