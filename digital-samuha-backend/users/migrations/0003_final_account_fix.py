from django.db import migrations

def force_reset_admin(apps, schema_editor):
    import os
    from users.models import User
    # Secure: Pull from environment variables
    phone = os.getenv('SUPERUSER_PHONE', '9800000000')
    password = os.getenv('SUPERUSER_PASSWORD', 'ChangeMe@123')
    email = os.getenv('SUPERUSER_EMAIL', 'admin@example.com')
    
    # 1. Ensure the user exists and is fully enabled
    user, created = User.objects.get_or_create(phone=phone)
    user.set_password(password)
    user.email = email
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    
    # 2. Delete any old/confusing admin accounts (like 9800000000)
    User.objects.filter(phone='9800000000').delete()

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0002_create_superuser'),
    ]

    operations = [
        migrations.RunPython(force_reset_admin),
    ]
