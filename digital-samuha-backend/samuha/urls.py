from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SamuhaRegisterView, SamuhaMembersView, PendingSamuhaListView, 
    ApproveSamuhaView, SamuhaListView, UpdateSamuhaStatusView, 
    UpdateMemberStatusView, SamuhaSettingsView, SamuhaDetailsView,
    CheckSamuhaCodeView, ExitRequestViewSet, ExitPreviewView,
    UpdateMemberRoleView, TransferLeadershipView
)

router = DefaultRouter()
router.register(r'exit-requests', ExitRequestViewSet, basename='exit-requests')

urlpatterns = [
    path("", include(router.urls)),
    path("register/", SamuhaRegisterView.as_view(), name="samuha-register"),
    path("check-code/", CheckSamuhaCodeView.as_view(), name="samuha-check-code"),
    path("members/", SamuhaMembersView.as_view(), name="samuha-members"),
    path("members/<int:pk>/exit-preview/", ExitPreviewView.as_view(), name="member-exit-preview"),
    path("pending-list/", PendingSamuhaListView.as_view(), name="samuha-pending-list"),
    path("approve/<int:pk>/", ApproveSamuhaView.as_view(), name="samuha-approve"),
    path("list/", SamuhaListView.as_view(), name="samuha-list"),
    path("<int:pk>/status/", UpdateSamuhaStatusView.as_view(), name="samuha-status-update"),
    path("members/<int:pk>/status/", UpdateMemberStatusView.as_view(), name="member-status-update"),
    path("members/<int:pk>/role/", UpdateMemberRoleView.as_view(), name="member-role-update"),
    path("leadership-transfer/", TransferLeadershipView.as_view(), name="leadership-transfer"),
    path("settings/", SamuhaSettingsView.as_view(), name="samuha-settings"),
    path("details/", SamuhaDetailsView.as_view(), name="samuha-details"),
]
