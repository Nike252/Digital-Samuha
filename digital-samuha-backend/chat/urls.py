from django.urls import path
from .views import MessageListCreateView, SamuhaAIView, StartCallView

urlpatterns = [
    path('messages/', MessageListCreateView.as_view(), name='message-list-create'),
    path('ai/', SamuhaAIView.as_view(), name='samuha-ai'),
    path('start-call/', StartCallView.as_view(), name='start-call'),
]
