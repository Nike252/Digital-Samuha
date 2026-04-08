from rest_framework import serializers
from .models import Plan, SamuhaSubscription

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'name', 'price', 'description']

class SamuhaSubscriptionSerializer(serializers.ModelSerializer):
    plan_details = PlanSerializer(source='plan', read_only=True)
    is_premium = serializers.BooleanField(source='is_currently_premium', read_only=True)
    
    class Meta:
        model = SamuhaSubscription
        fields = ['id', 'plan', 'plan_details', 'start_date', 'expiry_date', 'is_active', 'is_premium']
        read_only_fields = ['id', 'start_date', 'expiry_date', 'is_active']
