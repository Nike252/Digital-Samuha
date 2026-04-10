from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Meeting, Attendance
from .serializers import MeetingSerializer, AttendanceSerializer
from samuha.models import Membership

class MeetingListView(APIView):
    """List meetings for the user's Samuha or create a new meeting."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_membership = Membership.objects.filter(user=request.user, status=Membership.STATUS_ACTIVE).first()
        if not user_membership:
            return Response({"detail": "Active membership required."}, status=status.HTTP_403_FORBIDDEN)
        
        meetings = Meeting.objects.filter(samuha=user_membership.samuha)
        serializer = MeetingSerializer(meetings, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Only Adhakshya can create meetings
        user_membership = Membership.objects.filter(
            user=request.user, 
            role=Membership.ROLE_ADHAKSHYA,
            status=Membership.STATUS_ACTIVE
        ).first()
        
        if not user_membership:
            return Response({"detail": "Only an active Adhakshya can create meetings."}, status=status.HTTP_403_FORBIDDEN)

        serializer = MeetingSerializer(data=request.data)
        if serializer.is_valid():
            try:
                meeting = serializer.save(samuha=user_membership.samuha)
                
                # Broadcast notification to all members
                from notifications.utils import broadcast_notification
                broadcast_notification(
                    samuha=user_membership.samuha,
                    title="New Meeting Scheduled 📅",
                    message=f"A new meeting '{meeting.title}' has been scheduled for {meeting.date} at {meeting.start_time.strftime('%I:%M %p')}.",
                    link="/attendance",
                    type='meeting'
                )
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Handle unique constraint for samuha + date
                if "unique constraint" in str(e).lower() or "duplicate" in str(e).lower():
                    return Response({"detail": "A meeting for this date already exists."}, status=status.HTTP_400_BAD_REQUEST)
                return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeetingDetailView(APIView):
    """Retrieve or delete a specific meeting."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user_membership = Membership.objects.filter(user=request.user, status=Membership.STATUS_ACTIVE).first()
        if not user_membership:
            return Response({"detail": "Active membership required."}, status=status.HTTP_403_FORBIDDEN)
        
        meeting = get_object_or_404(Meeting, id=pk, samuha=user_membership.samuha)
        serializer = MeetingSerializer(meeting)
        return Response(serializer.data)

    def delete(self, request, pk):
        # Only Adhakshya can delete meetings
        user_membership = Membership.objects.filter(
            user=request.user, 
            role=Membership.ROLE_ADHAKSHYA,
            status=Membership.STATUS_ACTIVE
        ).first()
        
        if not user_membership:
            return Response({"detail": "Only the primary Adhakshya can delete meetings."}, status=status.HTTP_403_FORBIDDEN)

        meeting = get_object_or_404(Meeting, id=pk, samuha=user_membership.samuha)
        
        # Check if there are any transactions linked to this meeting
        from ledger.models import Transaction
        if Transaction.objects.filter(meeting=meeting).exists():
             return Response({
                 "detail": "Cannot delete a meeting that has recorded financial transactions (savings/fines). Please delete those transactions first."
             }, status=status.HTTP_400_BAD_REQUEST)

        meeting.delete()
        return Response({"detail": "Meeting deleted successfully."}, status=status.HTTP_200_OK)

class AttendanceBatchUpdateView(APIView):
    """Get or update attendance for a specific meeting."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        
        # Verify user belongs to this samuha
        if not Membership.objects.filter(user=request.user, samuha=meeting.samuha).exists():
            return Response({"detail": "Not a member of this Samuha."}, status=status.HTTP_403_FORBIDDEN)

        records = Attendance.objects.filter(meeting=meeting).select_related('user')
        
        # If no records exist yet, initialize them for all active members
        if not records.exists():
            active_memberships = Membership.objects.filter(samuha=meeting.samuha, status='active')
            new_records = [
                Attendance(meeting=meeting, user=membership.user, status=Attendance.STATUS_PRESENT) 
                for membership in active_memberships
            ]
            Attendance.objects.bulk_create(new_records)
            records = Attendance.objects.filter(meeting=meeting).select_related('user')

        # SMART SYNC: If user has already paid savings for this meeting, mark them as 'present' 
        # (even if they were auto-initialized or saved as absent before).
        from ledger.models import Transaction
        for record in records:
            if Transaction.objects.filter(meeting=meeting, user=record.user, type='saving').exists():
                if record.status == Attendance.STATUS_ABSENT:
                    record.status = Attendance.STATUS_PRESENT
                    record.fine_amount = 0.00 # Remove accidental absent fine
                    record.save()

        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)

    def post(self, request, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        
        # Permission check: Adhakshya or Co-Adhakshya
        user_membership = Membership.objects.filter(user=request.user, samuha=meeting.samuha, status=Membership.STATUS_ACTIVE).first()
        if not user_membership or user_membership.role not in [Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA]:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        # Additional check for Co-Adhakshya: Cannot update future meetings
        if user_membership.role == Membership.ROLE_CO_ADHAKSHYA:
            from django.utils import timezone
            from datetime import datetime
            meeting_start = timezone.make_aware(datetime.combine(meeting.date, meeting.start_time))
            if meeting_start > timezone.now():
                return Response({"detail": "Co-Adhakshya can only record attendance once the meeting has started."}, status=status.HTTP_403_FORBIDDEN)

        attendance_data = request.data.get('attendance', [])
        for item in attendance_data:
            record_id = item.get('id')
            if record_id:
                record = Attendance.objects.filter(id=record_id, meeting=meeting).first()
                if record:
                    record.status = item.get('status', record.status)
                    # Safely convert fine_amount to a number
                    try:
                        fine_val = item.get('fine_amount')
                        if fine_val in [None, '', 0, '0', 0.0, '0.00']:
                            # Auto-apply fine from Samuha rules
                            if record.status == Attendance.STATUS_ABSENT:
                                record.fine_amount = meeting.samuha.absent_fine
                            elif record.status == Attendance.STATUS_LATE:
                                record.fine_amount = meeting.samuha.late_fine
                            else:
                                record.fine_amount = 0.00
                        else:
                            record.fine_amount = float(fine_val)
                    except (ValueError, TypeError):
                        record.fine_amount = 0.00
                        
                    record.remarks = item.get('remarks', record.remarks)
                    record.save()
                    
                    # Create ledger transaction for fine if amount > 0
                    if record.fine_amount > 0:
                        from ledger.models import Transaction
                        # Avoid duplicates: only create if not exists for this meeting/user
                        if not Transaction.objects.filter(user=record.user, meeting=meeting, type='fine').exists():
                            Transaction.objects.create(
                                samuha=meeting.samuha,
                                user=record.user,
                                meeting=meeting,
                                amount=record.fine_amount,
                                type='fine',
                                description=f"Attendance fine ({record.get_status_display()}) for meeting on {meeting.date}"
                            )
        
        return Response({"detail": "Attendance updated successfully."})

class MarkAttendancePresentView(APIView):
    """Marks the authenticated user as present for a specific meeting."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        
        # Verify user belongs to this samuha
        if not Membership.objects.filter(user=request.user, samuha=meeting.samuha, status=Membership.STATUS_ACTIVE).exists():
            return Response({"detail": "Not an active member of this Samuha."}, status=status.HTTP_403_FORBIDDEN)
        
        # Find or create attendance record
        attendance, created = Attendance.objects.get_or_create(
            meeting=meeting,
            user=request.user,
            defaults={'status': Attendance.STATUS_PRESENT}
        )
        
        if not created:
            attendance.status = Attendance.STATUS_PRESENT
            attendance.save()
            
        return Response({"detail": "Attendance marked as present! ✅"})

