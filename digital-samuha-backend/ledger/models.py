from django.db import models
from django.conf import settings
from samuha.models import Samuha

class Transaction(models.Model):
    TYPE_SAVING = 'saving'
    TYPE_LOAN_DISBURSEMENT = 'loan_disbursement'
    TYPE_LOAN_REPAYMENT = 'loan_repayment'
    TYPE_INTEREST = 'interest'
    TYPE_FINE = 'fine'
    TYPE_EXPENSE = 'expense'

    TYPE_CHOICES = [
        (TYPE_SAVING, 'Monthly Saving'),
        (TYPE_LOAN_DISBURSEMENT, 'Loan Disbursement'),
        (TYPE_LOAN_REPAYMENT, 'Loan Repayment'),
        (TYPE_INTEREST, 'Interest Payment'),
        (TYPE_FINE, 'Fine Payment'),
        (TYPE_EXPENSE, 'Samuha Expense'),
    ]

    samuha = models.ForeignKey(Samuha, on_delete=models.CASCADE, related_name='transactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    meeting = models.ForeignKey('attendance.Meeting', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255, blank=True, null=True)
    external_id = models.CharField(max_length=100, unique=True, null=True, blank=True, help_text="Unique Gateway Transaction ID (e.g. eSewa/Khalti code)")
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type.upper()} - {self.amount} ({self.user.first_name if self.user else 'System'})"

class Loan(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_ACTIVE = 'active'
    STATUS_REJECTED = 'rejected'
    STATUS_PAID = 'paid'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending Approval'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_ACTIVE, 'Active (Disbursed)'),
        (STATUS_REJECTED, 'Rejected'),
        (STATUS_PAID, 'Fully Paid'),
    ]

    samuha = models.ForeignKey(Samuha, on_delete=models.CASCADE, related_name='loans')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Monthly Interest Rate %")
    
    # Tracking repayment
    remaining_principal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_interest_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    purpose = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # AI Risk Prediction Data
    annual_income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    dti_ratio = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Debt-to-Income Ratio %")
    employment_length = models.IntegerField(default=0, help_text="Years of employment")
    loan_term_months = models.IntegerField(default=12)
    
    applied_date = models.DateField(auto_now_add=True)
    approved_date = models.DateField(null=True, blank=True)
    disbursed_date = models.DateField(null=True, blank=True)
    interest_last_calculated = models.DateField(null=True, blank=True, help_text="Starting date for the next interest period")
    closed_date = models.DateField(null=True, blank=True)

    @property
    def monthly_interest_amount(self):
        """Calculates the monthly interest amount in NPR."""
        if self.interest_rate and self.principal_amount:
            return (self.principal_amount * self.interest_rate) / 100
        return 0

    def __str__(self):
        return f"Loan: {self.user.first_name} - {self.principal_amount} ({self.status})"
