from django.conf import settings
from django.db import models

from samuha.models import Samuha


class Announcement(models.Model):
    """
    Announcements posted by Adhakshya/Co-Adhakshya to all Samuha members.
    Examples: Meeting reminders, policy changes, important notices.
    """

    samuha = models.ForeignKey(
        Samuha,
        on_delete=models.CASCADE,
        related_name="announcements",
        help_text="The Samuha this announcement belongs to",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_announcements",
        help_text="User who created this announcement (Adhakshya/Co-Adhakshya)",
    )
    title = models.CharField(
        max_length=255,
        help_text="Short title for the announcement",
    )
    message = models.TextField(
        help_text="Full announcement message",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Set to False to archive/hide announcement",
    )
    display_from = models.DateField(
        null=True,
        blank=True,
        help_text="Date from which this announcement should be visible (leave blank for immediate)",
    )
    display_until = models.DateField(
        null=True,
        blank=True,
        help_text="Date until which this announcement should be visible (leave blank for permanent)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_currently_visible(self):
        """Check if announcement should be visible based on date range"""
        from django.utils import timezone
        today = timezone.now().date()
        
        # Check if active
        if not self.is_active:
            return False
        
        # Check display_from
        if self.display_from and today < self.display_from:
            return False
        
        # Check display_until
        if self.display_until and today > self.display_until:
            return False
        
        return True

    class Meta:
        ordering = ["-created_at"]  # Newest first
        verbose_name = "Announcement"
        verbose_name_plural = "Announcements"
        indexes = [
            models.Index(fields=["samuha", "-created_at"]),  # Optimize queries by Samuha
        ]

    def __str__(self):
        return f"{self.title} - {self.samuha.samuha_name}"
