from django.db import models
from django.conf import settings

# Create your models here.

class Transaction(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled / Failed'),
    )
    
    ESCROW_STATUS = (
        ('HELD', 'Held in Escrow'),
        ('RELEASED', 'Released to Vendor'),
        ('REFUNDED', 'Refunded to Organizer'),
        ('CANCELLED', 'Cancelled / No Funds Held'),
    )

    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    booking = models.OneToOneField('marketplace.BookingRequest', on_delete=models.CASCADE, related_name='transaction')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=15)
    
    # M-Pesa Specific Fields
    checkout_request_id = models.CharField(max_length=100, blank=True, null=True)
    merchant_request_id = models.CharField(max_length=100, blank=True, null=True)
    mpesa_receipt_number = models.CharField(max_length=50, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    escrow_status = models.CharField(max_length=20, choices=ESCROW_STATUS, default='HELD')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transaction {self.id} - KES {self.amount} - Status: {self.status}"