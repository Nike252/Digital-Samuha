from django.contrib import admin
from .models import Plan, SamuhaSubscription

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price')
    search_fields = ('name',)

@admin.register(SamuhaSubscription)
class SamuhaSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('samuha', 'plan', 'expiry_date', 'is_active')
    list_filter = ('plan', 'is_active')
    search_fields = ('samuha__samuha_name',)
