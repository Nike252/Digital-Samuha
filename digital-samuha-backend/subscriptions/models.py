from django.db import models
from django.utils import timezone
from samuha.models import Samuha

class Plan(models.Model):
    NAME_CHOICES = [
        ('basic', 'Basic (Free)'),
        ('premium', 'Premium (Professional)'),
    ]
    
    name = models.CharField(max_length=50, choices=NAME_CHOICES, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.get_name_display()

class SamuhaSubscription(models.Model):
    samuha = models.OneToOneField(Samuha, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name='samuha_subscriptions')
    start_date = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.samuha.samuha_name} - {self.plan.name}"

    def is_currently_premium(self):
        if self.plan.name != 'premium':
            return False
        if not self.is_active:
            return False
        if self.expiry_date and self.expiry_date < timezone.now():
            return False
        return True
