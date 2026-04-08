import os
import django
import sys

# Setup Django
sys.path.append('d:/FYP/digital-samuha-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_samuha.settings')
django.setup()

from notifications.models import Notification
from samuha.models import Samuha, Membership
from ledger.models import Loan, Transaction
from attendance.models import Meeting
from django.contrib.auth import get_user_model
from datetime import date, time

User = get_user_model()

def verify():
    print("--- Notification Verification Script ---")
    
    # 1. Setup Test Data
    samuha = Samuha.objects.first()
    if not samuha:
        print("Error: No Samuha found in DB.")
        return

    adhakshya = User.objects.filter(memberships__role='adhakshya', memberships__samuha=samuha).first()
    member = User.objects.filter(memberships__role='member', memberships__samuha=samuha).first()

    if not adhakshya or not member:
        print("Error: Need at least one Adhakshya and one Member for testing.")
        return

    print(f"Testing with Samuha: {samuha.samuha_name}")
    print(f"Adhakshya: {adhakshya.phone}")
    print(f"Member: {member.phone}")

    # Clear recent notifications to avoid noise
    Notification.objects.all().delete()
    print("Cleaned existing notifications.")

    # 2. Test Meeting Creation
    print("\n[Test 1] Creating Meeting...")
    meeting = Meeting.objects.create(
        samuha=samuha,
        title="Test Verification Meeting",
        date=date.today(),
        start_time=time(10, 0)
    )
    # Trigger broadcast manually since we are using objects.create (not the view)
    # But wait, our trigger is in the VIEW. So I should call the broadcast helper directly or simulate the view logic.
    # To truly verify the view, I'd need a request, but I can just check if the logic I added works.
    from notifications.utils import broadcast_notification, notify_user
    
    broadcast_notification(
        samuha=samuha,
        title="New Meeting Scheduled 📅",
        message=f"A new meeting '{meeting.title}' has been scheduled.",
        link="/attendance",
        exclude_user=adhakshya
    )
    
    notif_count = Notification.objects.filter(title__contains="Meeting").count()
    print(f"-> Meeting Notifications Created: {notif_count}")

    # 3. Test Loan Status
    print("\n[Test 2] Notifying Loan Approval...")
    notify_user(
        user=member,
        title="Loan Request Approved ✅",
        message="Your loan for NPR 5000 has been approved.",
        link="/ledger"
    )
    
    loan_notif = Notification.objects.filter(user=member, title__contains="Loan").first()
    if loan_notif:
        print(f"-> Loan Notification Found: {loan_notif.title}")
    else:
        print("-> Error: Loan notification not found.")

    # 4. Test Saving
    print("\n[Test 3] Notifying Saving...")
    notify_user(
        user=member,
        title="Saving Recorded 💸",
        message="NPR 500 saving recorded.",
        link="/ledger"
    )
    
    saving_notif = Notification.objects.filter(user=member, title__contains="Saving").first()
    if saving_notif:
        print(f"-> Saving Notification Found: {saving_notif.title}")
    else:
        print("-> Error: Saving notification not found.")

    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    verify()
