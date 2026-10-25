from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

# Create your models here.
class User(AbstractUser):
    # Make username optional since users will log in via email
    username = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True, blank=False) # Make emails unique

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] # Required when creating a superuser via terminal
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
    profile_picture = CloudinaryField('image', blank=True, null=True)

    def __str__(self):
        # Fallback to email if username is blank
        identifier = self.email or self.username
        return f"{identifier} ({self.get_role_display()})"
