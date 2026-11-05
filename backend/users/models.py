from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

class User(AbstractUser):
    username = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True, blank=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
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
        identifier = self.email or self.username
        return f"{identifier} ({self.get_role_display()})"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True, null=True)
    is_delivered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"