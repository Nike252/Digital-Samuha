from django.db import migrations
import os

def create_superuser(apps, schema_editor):
    from users.models import User
    phone = os.getenv('DJANGO_SUPERUSER_PHONE', '9800000000')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'Nikesha123')
    
    if not User.objects.filter(phone=phone).exists():
        User.objects.create_superuser(
            phone=phone,
            password=password,
            email=os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
        )

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]
