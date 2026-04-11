from django.db import migrations
import os

def create_superuser(apps, schema_editor):
    from users.models import User
    # Hardcoding the credentials for a guaranteed "No-Fail" login
    phone = '9807615242'
    password = 'Nikesh@123'
    email = 'nikes@gmail.com'
    
    user = User.objects.filter(phone=phone).first()
    if not user:
        User.objects.create_superuser(
            phone=phone,
            password=password,
            email=email
        )
    else:
        # Force reset password and staff status every deployment
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]
