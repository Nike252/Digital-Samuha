from django.db import models
from django.conf import settings
from samuha.models import Samuha

class Document(models.Model):
    CATEGORY_LEGAL = 'legal'
    CATEGORY_FINANCIAL = 'financial'
    CATEGORY_MEETING_MINUTE = 'meeting_minute'
    CATEGORY_PAYOUT = 'payout'
    CATEGORY_OTHER = 'other'

    CATEGORY_CHOICES = [
        (CATEGORY_LEGAL, 'Legal/Registration'),
        (CATEGORY_FINANCIAL, 'Financial Report'),
        (CATEGORY_MEETING_MINUTE, 'Meeting Minute'),
        (CATEGORY_PAYOUT, 'Official Payout Record'),
        (CATEGORY_OTHER, 'Other Official Document'),
    ]

    samuha = models.ForeignKey(Samuha, on_delete=models.CASCADE, related_name='documents')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/%Y/%m/')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default=CATEGORY_OTHER)
    file_size = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.file and not self.file_size:
            # Simple size calculation
            size = self.file.size
            if size < 1024:
                self.file_size = f"{size} B"
            elif size < 1024 * 1024:
                self.file_size = f"{round(size / 1024, 2)} KB"
            else:
                self.file_size = f"{round(size / (1024 * 1024), 2)} MB"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
