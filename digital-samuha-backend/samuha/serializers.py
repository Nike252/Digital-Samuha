from rest_framework import serializers

from .models import Samuha, Membership, ExitRequest


class SamuhaRegisterSerializer(serializers.ModelSerializer):
    """
    Register a Samuha for review by super admin.
    This is the FIRST step - no authentication required.
    Creates Samuha with status="pending" and generates samuha_code.
    No user account is created - adhakshya will signup later using the code.
    """

    class Meta:
        model = Samuha
        fields = [
            "id",
            "samuha_name",
            "province",
            "district",
            "municipality",
            "ward_number",
            "adhakshya_full_name",
            "adhakshya_phone",
            "adhakshya_email",
            "adhakshya_citizenship_no",
            "adhakshya_citizenship_front",
            "adhakshya_citizenship_back",
            "is_registered_with_government",
            "proof_document",
            "samuha_code",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "samuha_code", "status", "created_at"]

    def create(self, validated_data):
        # Create Samuha with status="pending" (default)
        # created_by will be None until adhakshya signs up
        # samuha_code is auto-generated in model.save()
        samuha = Samuha.objects.create(created_by=None, **validated_data)
        return samuha


class SamuhaSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for Adhakshya to update Samuha rules.
    """
    class Meta:
        model = Samuha
        fields = [
            "id",
            "samuha_name",
            "meeting_schedule_type",
            "meeting_day",
            "meeting_day_numeric",
            "meeting_week_offset",
            "meeting_frequency",
            "absent_fine",
            "late_fine",
            "loan_interest_rate",
            "default_meeting_time",
            "saving_amount"
        ]
        read_only_fields = ["id", "samuha_name"]


class ExitRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for member exit requests.
    """
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = ExitRequest
        fields = [
            "id",
            "user",
            "user_name",
            "user_phone",
            "samuha",
            "reason",
            "status",
            "settlement_amount",
            "created_at",
            "processed_at",
            "processed_by"
        ]
        read_only_fields = ["id", "user", "samuha", "status", "settlement_amount", "created_at", "processed_at", "processed_by"]


