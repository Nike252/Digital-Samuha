from django.core.mail import send_mail
from django.conf import settings
from .models import Notification
from samuha.models import Membership

def send_approval_email(samuha):
    """
    Sends an email to the Adhakshya with their Samuha code.
    """
    subject = f"Welcome to Digital Samuha - {samuha.samuha_name} Approved!"
    message = f"""
Dear {samuha.adhakshya_full_name},

Congratulations! Your Samuha registration for "{samuha.samuha_name}" has been approved.

Your unique Samuha Code is: {samuha.samuha_code}

You can now use this code to sign up as an Adhakshya and start managing your community.

Best regards,
The Digital Samuha Team
"""
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [samuha.adhakshya_email],
        fail_silently=False,
    )

def notify_user(user, title, message, link=None, type='other'):
    """Send a notification to a specific user."""
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        link=link,
        type=type
    )

def broadcast_notification(samuha, title, message, link=None, exclude_user=None, type='other'):
    """Send a notification to all active members of a Samuha."""
    memberships = Membership.objects.filter(samuha=samuha, status=Membership.STATUS_ACTIVE)
    if exclude_user:
        memberships = memberships.exclude(user=exclude_user)
    
    notifications = []
    for membership in memberships:
        notifications.append(Notification(
            user=membership.user,
            title=title,
            message=message,
            link=link,
            type=type
        ))
    
    if notifications:
        Notification.objects.bulk_create(notifications)
