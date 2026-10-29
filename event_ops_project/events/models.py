from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField
# Create your models here.

class Event(models.Model):
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='events'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    banner = CloudinaryField('image', blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    venue_name = models.CharField(max_length=150)
    venue_location = models.CharField(max_length=255)
    max_capacity = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title