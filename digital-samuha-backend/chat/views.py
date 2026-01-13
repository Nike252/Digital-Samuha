from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message
from .serializers import MessageSerializer
from samuha.models import Membership
from .ai_utils import get_samuha_context, ask_samuha_ai
from notifications.utils import broadcast_notification

class MessageListCreateView(generics.ListCreateAPIView):
    """List and create chat messages for the user's Samuha."""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        membership = Membership.objects.filter(user=self.request.user, status=Membership.STATUS_ACTIVE).first()
        if not membership:
            return Message.objects.none()
        return Message.objects.filter(samuha=membership.samuha).select_related('sender')

    def perform_create(self, serializer):
        membership = Membership.objects.filter(user=self.request.user, status=Membership.STATUS_ACTIVE).first()
        if not membership:
            raise permissions.PermissionDenied("You must be an active member to send messages.")
        serializer.save(sender=self.request.user, samuha=membership.samuha)

class SamuhaAIView(APIView):
    """Ask Samuha AI (Cerebro) a question with group context."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        membership = Membership.objects.filter(user=request.user, status=Membership.STATUS_ACTIVE).first()
        if not membership:
            return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)

        # 💎 Premium Feature Locking
        if not membership.samuha.is_premium:
            return Response(
                {"error": "Cerebro AI is a premium feature. Please upgrade your Samuha subscription to unlock it."},
                status=status.HTTP_403_FORBIDDEN
            )

        prompt = request.data.get("prompt")
        if not prompt:
            return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Gather context (Now with Personal Data!)
        samuha_context = get_samuha_context(membership.samuha, membership=membership)
        
        # Get AI Response
        ai_response = ask_samuha_ai(prompt, samuha_context)
        
        return Response({
            "response": ai_response,
            "samuha": membership.samuha.samuha_name
        }, status=status.HTTP_200_OK)

class StartCallView(APIView):
    """Notify all members that a video call has started."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        membership = Membership.objects.filter(user=request.user, status=Membership.STATUS_ACTIVE).first()
        if not membership:
            return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)

        if not membership.samuha.is_premium:
            return Response({"error": "Video calls are a premium feature."}, status=status.HTTP_403_FORBIDDEN)

        room_id = request.data.get("roomID", "broadcast")
        
        # Call broadcast removed as per user request
        return Response({"detail": "Call mode active."}, status=status.HTTP_200_OK)
