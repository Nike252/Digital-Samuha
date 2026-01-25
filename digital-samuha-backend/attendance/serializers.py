from rest_framework import serializers
from .models import Meeting, Attendance
from users.serializers import UserSerializer

class AttendanceSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'user', 'user_details', 'status', 'fine_amount', 'remarks']

class MeetingSerializer(serializers.ModelSerializer):
    attendance_count = serializers.IntegerField(source='attendance_records.count', read_only=True)

    class Meta:
        model = Meeting
        fields = ['id', 'samuha', 'date', 'start_time', 'title', 'description', 'attendance_count', 'created_at']
        read_only_fields = ['id', 'samuha', 'created_at']
