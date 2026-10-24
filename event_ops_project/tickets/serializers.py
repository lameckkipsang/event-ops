from rest_framework import serializers
from .models import Ticket, TicketTier

class TicketTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketTier
        fields = ['id', 'event', 'ticket_type', 'price', 'quantity_available']
        read_only_fields = ['event']

class TicketSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    ticket_type_name = serializers.CharField(source='tier.ticket_type', read_only=True)
    price = serializers.DecimalField(source='tier.price', max_digits=10, decimal_places=2, read_only=True)
    attendee_email = serializers.EmailField(source='attendee.email', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 
            'event', 
            'event_title', 
            'tier',
            'ticket_type_name',
            'attendee', 
            'attendee_email', 
            'price', 
            'ticket_code', 
            'is_checked_in', 
            'purchased_at'
        ]
        read_only_fields = ['id', 'attendee', 'event', 'ticket_code', 'is_checked_in', 'purchased_at']

class TicketCheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['is_checked_in']