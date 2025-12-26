from django.contrib import admin

from .models import Membership, Samuha


@admin.register(Samuha)
class SamuhaAdmin(admin.ModelAdmin):
    list_display = ("id", "samuha_name", "samuha_code", "province", "district", "status", "adhakshya_email", "created_at")
    list_display_links = ("samuha_name", "samuha_code")
    search_fields = ("samuha_name", "samuha_code", "adhakshya_full_name", "adhakshya_phone", "adhakshya_email")
    list_filter = ("status", "province", "district", "is_registered_with_government", "created_at")
    readonly_fields = ("samuha_code", "created_at", "created_by")
    fieldsets = (
        ("Basic Information", {
            "fields": ("samuha_name", "samuha_code", "status")
        }),
        ("Location", {
            "fields": ("province", "district", "municipality", "ward_number")
        }),
        ("Adhakshya Contact Information", {
            "fields": ("adhakshya_full_name", "adhakshya_phone", "adhakshya_email"),
            "description": "Contact information for the adhakshya. They will signup later using the Samuha code."
        }),
        ("Registration", {
            "fields": ("is_registered_with_government", "proof_document")
        }),
        ("Metadata", {
            "fields": ("created_by", "created_at"),
            "classes": ("collapse",),
            "description": "created_by will be set when adhakshya signs up using the Samuha code."
        }),
    )
    ordering = ("-created_at",)
    
    def get_readonly_fields(self, request, obj=None):
        """Make samuha_code readonly, but allow status changes for approval"""
        readonly = list(self.readonly_fields)
        if obj and obj.status == "pending":
            # Allow changing status from pending to active
            pass
        return readonly


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "samuha", "role", "is_approved", "joined_at")
    list_display_links = ("user", "samuha")
    search_fields = ("user__phone", "user__email", "samuha__samuha_name", "samuha__samuha_code")
    list_filter = ("role", "is_approved", "joined_at")
    readonly_fields = ("joined_at",)
    ordering = ("-joined_at",)

