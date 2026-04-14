from rest_framework import serializers
from .models import Transaction, Loan
from users.serializers import UserSerializer

class TransactionSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    user_id = serializers.ReadOnlyField(source='user.id')
    meeting_status = serializers.ReadOnlyField(source='meeting.status')
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'samuha', 'user', 'user_id', 'user_details', 'meeting', 
            'meeting_status', 'type', 'amount', 'description', 'date', 'created_at'
        ]
        read_only_fields = ['id', 'samuha', 'created_at', 'user_id', 'meeting_status']

class LoanSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    total_repayments = serializers.SerializerMethodField()
    accrued_interest = serializers.SerializerMethodField()
    
    class Meta:
        model = Loan
        fields = [
            'id', 'samuha', 'user', 'user_details', 'principal_amount', 
            'interest_rate', 'monthly_interest_amount', 'remaining_principal', 
            'accrued_interest', 'total_repayments', 'total_interest_paid', 
            'purpose', 'status', 'annual_income', 'dti_ratio', 
            'employment_length', 'loan_term_months',
            'applied_date', 'approved_date', 
            'disbursed_date', 'closed_date'
        ]
        read_only_fields = [
            'id', 'samuha', 'interest_rate', 'monthly_interest_amount',
            'remaining_principal', 'total_interest_paid', 'status', 
            'applied_date', 'approved_date', 'disbursed_date', 'closed_date'
        ]

    def get_total_repayments(self, obj):
        if obj.status in [Loan.STATUS_ACTIVE, Loan.STATUS_PAID]:
            return float(obj.principal_amount - obj.remaining_principal)
        return 0.0

    def get_accrued_interest(self, obj):
        from .services import calculate_interest_accrued
        return float(calculate_interest_accrued(obj))

    def to_representation(self, instance):
        """Restrict sensitive fields based on user role and ownership."""
        rep = super().to_representation(instance)
        user = self.context['request'].user
        
        # Check if user is Adhakshya/Co-Adhakshya or the Borrower
        from samuha.models import Membership
        membership = Membership.objects.filter(user=user, samuha=instance.samuha).first()
        is_admin = membership and membership.role in [Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA]
        is_borrower = instance.user == user
        
        if not (is_admin or is_borrower):
            # Hide sensitive underwriting data from other members
            sensitive_fields = ['annual_income', 'dti_ratio', 'employment_length']
            for field in sensitive_fields:
                rep.pop(field, None)
                
        return rep

