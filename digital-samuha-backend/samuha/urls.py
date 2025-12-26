from django.urls import path

from .views import (
    SamuhaRegisterView, SamuhaMembersView, PendingSamuhaListView, 
    ApproveSamuhaView, SamuhaListView, UpdateSamuhaStatusView, 
    UpdateMemberStatusView, SamuhaSettingsView, SamuhaDetailsView,
    CheckSamuhaCodeView
)


urlpatterns = [
    path("register/", SamuhaRegisterView.as_view(), name="samuha-register"),
    path("check-code/", CheckSamuhaCodeView.as_view(), name="samuha-check-code"),
    path("members/", SamuhaMembersView.as_view(), name="samuha-members"),
    path("pending-list/", PendingSamuhaListView.as_view(), name="samuha-pending-list"),
    path("approve/<int:pk>/", ApproveSamuhaView.as_view(), name="samuha-approve"),
    path("list/", SamuhaListView.as_view(), name="samuha-list"),
    path("<int:pk>/status/", UpdateSamuhaStatusView.as_view(), name="samuha-status-update"),
    path("members/<int:pk>/status/", UpdateMemberStatusView.as_view(), name="member-status-update"),
    path("settings/", SamuhaSettingsView.as_view(), name="samuha-settings"),
    path("details/", SamuhaDetailsView.as_view(), name="samuha-details"),
]
