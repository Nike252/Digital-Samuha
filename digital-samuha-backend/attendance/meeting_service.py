from datetime import datetime
from django.utils import timezone
from .models import Meeting, Attendance

def is_meeting_day(samuha, check_date):
    """
    Checks if check_date is a scheduled meeting day for the given Samuha.
    """
    schedule_type = samuha.meeting_schedule_type
    
    # 1. Specific date of every month (e.g., 15th)
    if schedule_type == 'fixed_date':
        return check_date.day == samuha.meeting_day_numeric
    
    # 2. Every week on a specific day (e.g., Saturday)
    if schedule_type == 'weekly':
        return check_date.strftime('%A') == samuha.meeting_day
        
    # 3. Relative weekday (e.g., 1st Saturday)
    if schedule_type == 'relative_weekday':
        # Check if day match first
        if check_date.strftime('%A') != samuha.meeting_day:
            return False
            
        # Calculate which occurrence of this weekday it is (1st, 2nd, etc.)
        day_occurrence = (check_date.day - 1) // 7 + 1
        return day_occurrence == samuha.meeting_week_offset
        
    return False

def get_or_create_scheduled_meeting(samuha, check_date=None):
    """
    Checks the schedule and automatically creates an ACTIVE meeting 
    if today matches the Samuha rules.
    """
    if check_date is None:
        check_date = timezone.now().date()
        
    # 1. Verify if today is a scheduled meeting day
    if not is_meeting_day(samuha, check_date):
        return None
        
    # 2. Get or create the meeting (Unique of samuha + date)
    meeting, created = Meeting.objects.get_or_create(
        samuha=samuha,
        date=check_date,
        defaults={
            'title': f"Scheduled Monthly Meeting - {check_date.strftime('%B %Y')}",
            'start_time': samuha.default_meeting_time,
            'status': Meeting.STATUS_ACTIVE,
            'description': f"Automated meeting created based on Samuha schedule ({samuha.get_meeting_schedule_type_display()})."
        }
    )
    
    # 3. If newly created, initialize attendance for all active members
    if created:
        from samuha.models import Membership
        active_memberships = Membership.objects.filter(samuha=samuha, status=Membership.STATUS_ACTIVE)
        attendance_records = [
            Attendance(meeting=meeting, user=membership.user, status=Attendance.STATUS_ABSENT) 
            for membership in active_memberships
        ]
        Attendance.objects.bulk_create(attendance_records)
        
    # Ensure it's active if it was already "planned" but let's keep it active
    elif meeting.status == Meeting.STATUS_PLANNED:
        meeting.status = Meeting.STATUS_ACTIVE
        meeting.save()
        
    return meeting
