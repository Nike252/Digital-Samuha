from django.db import migrations
import os

def create_superuser(apps, schema_editor):
    from users.models import User
    # Pull credentials from environment variables (never hardcode secrets!)
    phone = os.getenv('SUPERUSER_PHONE', '9800000000')
    password = os.getenv('SUPERUSER_PASSWORD', 'ChangeMe@123')
    email = os.getenv('SUPERUSER_EMAIL', 'admin@example.com')
    
    user = User.objects.filter(phone=phone).first()
    if not user:
        User.objects.create_superuser(
            phone=phone,
            password=password,
            email=email,
            is_active=True
        )
    else:
        # Force reset password, staff status, and active status
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]
