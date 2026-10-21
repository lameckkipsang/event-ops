from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = [
            'organizer', 
            'status', 
            'escrow_status', 
            'checkout_request_id', 
            'merchant_request_id', 
            'mpesa_receipt_number'
        ]

class InitiatePaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    phone_number = serializers.CharField(max_length=15)