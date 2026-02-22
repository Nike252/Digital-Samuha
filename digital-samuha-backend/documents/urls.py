from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, MeetingRecordView, WardNiwedanView

router = DefaultRouter()
router.register(r'files', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
    path('meetings/<int:meeting_id>/report/', MeetingRecordView.as_view(), name='meeting-report'),
    path('niwedan/', WardNiwedanView.as_view(), name='ward-niwedan'),
]
