from django.contrib import admin

from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    """Admin interface for Announcement model"""

    list_display = ["title", "samuha", "created_by", "is_active", "created_at"]
    list_filter = ["is_active", "created_at", "samuha"]
    search_fields = ["title", "message", "samuha__samuha_name", "created_by__phone"]
    readonly_fields = ["created_at", "updated_at"]
    date_hierarchy = "created_at"

    fieldsets = [
        (
            "Basic Information",
            {
                "fields": ["samuha", "created_by", "title", "message"],
            },
        ),
        (
            "Status",
            {
                "fields": ["is_active"],
            },
        ),
        (
            "Timestamps",
            {
                "fields": ["created_at", "updated_at"],
                "classes": ["collapse"],
            },
        ),
    ]

    def get_queryset(self, request):
        """Optimize queries"""
        return super().get_queryset(request).select_related("samuha", "created_by")
