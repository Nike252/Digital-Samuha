from django.contrib import admin
from .models import Meeting, Attendance

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('samuha', 'title', 'date', 'created_at')
    list_filter = ('date', 'samuha')
    search_fields = ('title', 'samuha__samuha_name')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'meeting', 'status', 'fine_amount')
    list_filter = ('status', 'meeting__date', 'meeting__samuha')
    search_fields = ('user__phone', 'meeting__title')
