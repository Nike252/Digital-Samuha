from django.db import migrations

def seed_plans(apps, schema_editor):
    Plan = apps.get_model('subscriptions', 'Plan')
    
    # Create Basic Plan
    Plan.objects.get_or_create(
        name='basic',
        defaults={
            'price': 0.00,
            'description': 'Free core financial management and simple group chat.'
        }
    )
    
    # Create Premium Plan (1,500 NPR)
    Plan.objects.get_or_create(
        name='premium',
        defaults={
            'price': 1500.00,
            'description': 'Advanced AI Bot, Video Meetings, and Multimedia features.'
        }
    )

class Migration(migrations.Migration):
    dependencies = [
        ('subscriptions', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_plans),
    ]
