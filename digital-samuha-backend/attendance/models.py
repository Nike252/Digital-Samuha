from django.db import models
from django.conf import settings
from samuha.models import Samuha

class Meeting(models.Model):
    STATUS_PLANNED = 'planned'
    STATUS_ACTIVE = 'active'
    STATUS_COMPLETED = 'completed'

    STATUS_CHOICES = [
        (STATUS_PLANNED, 'Planned'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_COMPLETED, 'Completed'),
    ]

    samuha = models.ForeignKey(Samuha, on_delete=models.CASCADE, related_name="meetings")
    date = models.DateField()
    start_time = models.TimeField(default="10:00:00")
    title = models.CharField(max_length=255, default="Monthly Meeting")
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PLANNED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['samuha', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.samuha.samuha_name} - {self.date}"

class Attendance(models.Model):
    STATUS_PRESENT = 'present'
    STATUS_ABSENT = 'absent'
    STATUS_LATE = 'late'

    STATUS_CHOICES = [
        (STATUS_PRESENT, 'Present'),
        (STATUS_ABSENT, 'Absent'),
        (STATUS_LATE, 'Late'),
    ]

    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="attendance_records")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendance_history")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PRESENT)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    remarks = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ['meeting', 'user']

    def __str__(self):
        return f"{self.user.phone} - {self.meeting.date} ({self.status})"
