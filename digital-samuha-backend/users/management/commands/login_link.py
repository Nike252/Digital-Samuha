import webbrowser
import getpass
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

class Command(BaseCommand):
    help = 'Generate a magic login link for a Super Admin and open it in the browser.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- Digital Samuha: Super Admin Magic Login ---'))
        
        phone = input('Enter Super Admin Phone: ').strip()
        password = getpass.getpass('Enter Password: ')

        user = authenticate(username=phone, password=password)

        if not user:
            raise CommandError('Invalid credentials.')

        if not user.is_superuser:
            raise CommandError('Access Denied: User is not a Super Admin.')

        # Generate JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Construct Link (assuming frontend is at localhost:5173)
        # We can make this configurable if needed
        frontend_url = 'http://localhost:5173'
        magic_link = f'{frontend_url}/magic-login?token={access_token}'

        self.stdout.write(self.style.SUCCESS('\nAuthentication Successful!'))
        self.stdout.write(f'Your Magic Link: {self.style.WARNING(magic_link)}\n')
        self.stdout.write('Opening browser...')

        try:
            webbrowser.open(magic_link)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Could not open browser automatically: {e}'))
            self.stdout.write('Please copy and paste the link manually.')
