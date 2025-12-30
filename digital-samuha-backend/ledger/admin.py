from django.contrib import admin
from .models import Transaction, Loan

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'amount', 'user', 'samuha', 'date')
    list_filter = ('type', 'samuha', 'date')
    search_fields = ('user__phone', 'description')

@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'samuha', 'principal_amount', 'status', 'applied_date')
    list_filter = ('status', 'samuha')
    search_fields = ('user__phone', 'purpose')
