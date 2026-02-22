from rest_framework import serializers
from .models import Document
from users.serializers import UserSerializer

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'samuha', 'uploaded_by', 'uploaded_by_details', 
            'title', 'file', 'category', 'file_size', 'created_at'
        ]
        read_only_fields = ['id', 'samuha', 'uploaded_by', 'file_size', 'created_at']
