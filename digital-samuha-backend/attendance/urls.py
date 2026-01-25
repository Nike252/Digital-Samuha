from django.urls import path
from .views import MeetingListView, AttendanceBatchUpdateView, MeetingDetailView, MarkAttendancePresentView

urlpatterns = [
    path('meetings/', MeetingListView.as_view(), name='meeting-list'),
    path('meetings/<int:pk>/', MeetingDetailView.as_view(), name='meeting-detail'),
    path('meetings/<int:meeting_id>/attendance/', AttendanceBatchUpdateView.as_view(), name='attendance-batch-update'),
    path('meetings/<int:meeting_id>/mark-present/', MarkAttendancePresentView.as_view(), name='mark-attendance-present'),
]
