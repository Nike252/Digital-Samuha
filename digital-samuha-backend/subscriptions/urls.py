from django.urls import path
from .views import (
    SubscriptionStatusView, UpgradeSubscriptionView, PlanListView, 
    eSewaInitiateView, eSewaVerifyView, CalculateMeetingPaymentView,
    eSewaMeetingInitiateView
)

urlpatterns = [
    path('status/', SubscriptionStatusView.as_view(), name='subscription-status'),
    path('upgrade/', UpgradeSubscriptionView.as_view(), name='subscription-upgrade'),
    path('plans/', PlanListView.as_view(), name='plan-list'),
    path('esewa/initiate/', eSewaInitiateView.as_view(), name='esewa-initiate'),
    path('esewa/verify/', eSewaVerifyView.as_view(), name='esewa-verify'),
    path('esewa/initiate-meeting/', eSewaMeetingInitiateView.as_view(), name='esewa-meeting-init'),
    path('calculate-meeting-fee/', CalculateMeetingPaymentView.as_view(), name='calculate-fee'),
]
