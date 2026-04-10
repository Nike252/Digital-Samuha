import uuid

from django.conf import settings
from django.db import models


class Samuha(models.Model):
    STATUS_PENDING = "pending"
    STATUS_ACTIVE = "active"
    STATUS_INACTIVE = "inactive"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_INACTIVE, "Inactive"),
    ]

    samuha_name = models.CharField(max_length=255)
    province = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    municipality = models.CharField(max_length=150)
    ward_number = models.CharField(max_length=10)

    adhakshya_full_name = models.CharField(max_length=255)
    adhakshya_phone = models.CharField(max_length=20)
    adhakshya_email = models.EmailField()
    adhakshya_citizenship_no = models.CharField(max_length=50, blank=True, null=True, help_text="Citizenship Number of the Adhakshya")

    is_registered_with_government = models.BooleanField(default=False)
    proof_document = models.FileField(upload_to="proof_documents/", blank=True, null=True)

    samuha_code = models.CharField(max_length=32, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="samuha_created",
        null=True,
        blank=True,
        help_text="User who created this Samuha (set when adhakshya signs up)",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # Samuha Rules & Regulations
    meeting_schedule_type = models.CharField(
        max_length=20,
        choices=[
            ('weekly', 'Every week on a specific day'),
            ('fixed_date', 'Specific date of every month'),
            ('relative_weekday', 'Specific week and day (e.g. 1st Saturday)'),
        ],
        default='weekly',
        help_text="Type of meeting schedule"
    )
    meeting_day = models.CharField(
        max_length=20, 
        default="Saturday",
        help_text="Day of the week (e.g., Saturday)"
    )
    meeting_day_numeric = models.IntegerField(
        null=True,
        blank=True,
        help_text="Numeric date of the month (1-32) for fixed_date schedule"
    )
    meeting_week_offset = models.IntegerField(
        null=True,
        blank=True,
        help_text="Week number (1-5) for relative_weekday schedule"
    )
    meeting_frequency = models.CharField(
        max_length=20, 
        default="Monthly", 
        help_text="Frequency of meetings"
    )
    absent_fine = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=100.00,
        help_text="Fine amount for being absent"
    )
    late_fine = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=50.00,
        help_text="Fine amount for being late"
    )
    loan_interest_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=1.00,
        help_text="Monthly interest rate for loans (%)"
    )
    default_meeting_time = models.TimeField(
        default="10:00:00",
        help_text="Default start time for meetings"
    )
    saving_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=500.00,
        help_text="Standard monthly saving amount for all members"
    )

    def save(self, *args, **kwargs):
        if not self.samuha_code:
            # Simple code, e.g. SMH-123456
            self.samuha_code = f"SMH-{str(uuid.uuid4().int)[:6]}"
        super().save(*args, **kwargs)

    @property
    def is_premium(self):
        """Check if the Samuha has an active premium subscription."""
        try:
            return self.subscription.is_currently_premium()
        except:
            return False

    def __str__(self) -> str:
        return f"{self.samuha_name} ({self.samuha_code})"


class Membership(models.Model):
    """
    Links a User to a Samuha with a specific role.
    """

    ROLE_ADHAKSHYA = "adhakshya"
    ROLE_CO_ADHAKSHYA = "co_adhakshya"
    ROLE_MEMBER = "member"

    ROLE_CHOICES = [
        (ROLE_ADHAKSHYA, "Adhakshya"),
        (ROLE_CO_ADHAKSHYA, "Co-Adhakshya"),
        (ROLE_MEMBER, "Member"),
    ]

    STATUS_PENDING = "pending"
    STATUS_ACTIVE = "active"
    STATUS_INACTIVE = "inactive"
    STATUS_REJECTED = "rejected"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_INACTIVE, "Inactive"),
        (STATUS_REJECTED, "Rejected"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    samuha = models.ForeignKey(
        Samuha,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)  # Legacy - will sync with status

    class Meta:
        unique_together = [["user", "samuha"]]
        verbose_name_plural = "Memberships"

    def __str__(self) -> str:
        return f"{self.user.phone} - {self.samuha.samuha_name} ({self.get_role_display()} - {self.get_status_display()})"


