from django.db import models
import uuid
from django.conf import settings

# Create your models here.

class Ticket(models.Model):
    class TicketType(models.TextChoices):
        REGULAR = 'REGULAR', 'Regular'
        VIP = 'VIP', 'VIP'
        VVIP = 'VVIP', 'VVIP'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='tickets')
    attendee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    ticket_type = models.CharField(max_length=20, choices=TicketType.choices, default=TicketType.REGULAR)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    ticket_code = models.CharField(max_length=50, unique=True, blank=True)
    is_checked_in = models.BooleanField(default=False)
    purchased_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.ticket_code:
            self.ticket_code = f"TCK-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_type} - {self.ticket_code}"
