from django.apps import AppConfig


class LedgerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ledger'

    def ready(self):
        # Automated fine sync disabled as per user request. 
        # Fines are only recorded in ledger when actually paid during savings collection.
        # from . import signals
        pass
