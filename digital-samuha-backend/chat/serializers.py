from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'samuha', 'sender', 'sender_id', 'sender_name', 'content', 'attachment', 'attachment_type', 'type', 'created_at']
        read_only_fields = ['id', 'samuha', 'sender', 'sender_id', 'sender_name', 'created_at']
