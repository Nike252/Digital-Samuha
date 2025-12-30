from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from attendance.models import Attendance
from .models import Transaction

@receiver(post_save, sender=Attendance)
def sync_fine_transaction(sender, instance, created, **kwargs):
    """
    Automatically create/update a fine transaction in the ledger 
    when attendance is marked with a fine.
    """
    try:
        current_fine = float(instance.fine_amount)
    except (ValueError, TypeError):
        current_fine = 0.0

    if current_fine > 0:
        # Create or update transaction
        Transaction.objects.update_or_create(
            user=instance.user,
            meeting=instance.meeting,
            samuha=instance.meeting.samuha,
            type=Transaction.TYPE_FINE,
            defaults={
                'amount': instance.fine_amount,
                'description': f"Fine for meeting on {instance.meeting.date} ({instance.status})"
            }
        )
    else:
        # If fine was removed (set to 0), delete the transaction if it exists
        Transaction.objects.filter(
            user=instance.user,
            meeting=instance.meeting,
            type=Transaction.TYPE_FINE
        ).delete()

@receiver(post_delete, sender=Attendance)
def delete_fine_transaction(sender, instance, **kwargs):
    """Delete the fine transaction if the attendance record is deleted."""
    Transaction.objects.filter(
        user=instance.user,
        meeting=instance.meeting,
        type=Transaction.TYPE_FINE
    ).delete()
