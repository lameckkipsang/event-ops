from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    class Role(models.TextChoices):
        ORGANIZER = 'ORGANIZER', 'Event Organizer'
        VENDOR = 'VENDOR', 'Vendor / Supplier'
        SECURITY = 'SECURITY', 'Security Agency'
        ATTENDEE = 'ATTENDEE', 'Attendee'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ATTENDEE
    )
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    company_name = models.CharField(max_length=100, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
