from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "phone", "email", "is_staff", "is_active")
    search_fields = ("phone", "email")
    list_filter = ("is_staff", "is_active")


