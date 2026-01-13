from django.db import models
from django.contrib.auth import get_user_model
from samuha.models import Samuha

User = get_user_model()

class Message(models.Model):
    """Chat message within a Samuha group."""
    samuha = models.ForeignKey(Samuha, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True, null=True)
    attachment = models.FileField(upload_to='chat_attachments/', blank=True, null=True)
    attachment_type = models.CharField(max_length=20, blank=True, null=True) # image, video, document
    type = models.CharField(max_length=10, choices=[('text', 'Text'), ('system', 'System')], default='text')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['samuha', 'created_at']),
        ]

    def __str__(self):
        return f"{self.sender.full_name}: {self.content[:50]}"
