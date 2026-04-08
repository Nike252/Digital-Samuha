from rest_framework import serializers

from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    """
    Serializer for reading announcements.
    Includes creator info and relative timestamps.
    """

    created_by_name = serializers.SerializerMethodField()
    samuha_name = serializers.CharField(source="samuha.samuha_name", read_only=True)
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            "id",
            "samuha",
            "samuha_name",
            "created_by",
            "created_by_name",
            "title",
            "message",
            "is_active",
            "display_from",
            "display_until",
            "created_at",
            "updated_at",
            "time_ago",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def get_created_by_name(self, obj):
        """Return full name of creator"""
        user = obj.created_by
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name if full_name else user.phone

    def get_time_ago(self, obj):
        """Return human-readable time difference"""
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        diff = now - obj.created_at

        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} day{'s' if days > 1 else ''} ago"
        else:
            return obj.created_at.strftime("%b %d, %Y")


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating announcements.
    """

    class Meta:
        model = Announcement
        fields = ["title", "message", "is_active", "display_from", "display_until"]

    def validate_title(self, value):
        """Ensure title is not empty or just whitespace"""
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()

    def validate_message(self, value):
        """Ensure message is not empty or just whitespace"""
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        return value.strip()

    def validate(self, attrs):
        """Validate date range"""
        display_from = attrs.get("display_from")
        display_until = attrs.get("display_until")

        if display_from and display_until and display_from > display_until:
            raise serializers.ValidationError({
                "display_until": "End date must be after start date."
            })

        return attrs
