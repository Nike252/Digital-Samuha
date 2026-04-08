import os
import django
import sys

# Setup Django
sys.path.append('d:/FYP/digital-samuha-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_samuha.settings')
django.setup()

from notifications.models import Notification
from samuha.models import Membership
from django.contrib.auth import get_user_model
from notifications.utils import notify_user

User = get_user_model()

def verify():
    print("--- Adhakshya Notification Trigger ---")
    
    # Target the Adhakshya
    adhakshya = User.objects.get(phone='9862762231')
    
    # Send a TEST notification with the new 'type' field
    notif = notify_user(
        user=adhakshya,
        title="Restoration Complete! 🔔",
        message="The notification system is now fully live with real-time polling.",
        link="/dashboard",
        type='other'
    )
    
    print(f"Created Notification ID: {notif.id} for {adhakshya.phone}")
    print(f"Type: {notif.type}")
    print("Please check your browser now. The red dot should appear within 30 seconds.")

if __name__ == "__main__":
    verify()
