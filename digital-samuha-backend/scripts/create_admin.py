import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_samuha.settings')
django.setup()

from users.models import User

def create_admin():
    phone = os.getenv('DJANGO_SUPERUSER_PHONE', '9800000000')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'Nikesha123')
    
    if not User.objects.filter(phone=phone).exists():
        print(f"Creating superuser for phone {phone}...")
        User.objects.create_superuser(phone=phone, password=password)
        print("Superuser created successfully!")
    else:
        print(f"Superuser with phone {phone} already exists.")

if __name__ == "__main__":
    create_admin()
