from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    organizer_username = serializers.ReadOnlyField(source='organizer.username')
    booking_title = serializers.ReadOnlyField(source='booking.package.title')
    booking_tier = serializers.ReadOnlyField(source='booking.package.get_tier_display')
    class Meta:
        model = Transaction
        fields = (
            'id',
            'organizer',
            'organizer_username',
            'booking',
            'booking_title',
            'booking_tier',
            'amount',
            'phone_number',
            'checkout_request_id',
            'merchant_request_id',
            'mpesa_receipt_number',
            'status',
            'escrow_status',
            'created_at',
            'updated_at'
        )
        read_only_fields = [
            'organizer', 
            'status', 
            'escrow_status', 
            'checkout_request_id', 
            'merchant_request_id', 
            'mpesa_receipt_number',
            'created_at',
            'updated_at'
        ]

class InitiatePaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    phone_number = serializers.CharField(max_length=15)