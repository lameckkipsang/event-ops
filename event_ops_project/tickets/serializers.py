from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    attendee_email = serializers.EmailField(source='attendee.email', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 
            'event', 
            'event_title', 
            'attendee', 
            'attendee_email', 
            'ticket_type', 
            'price', 
            'ticket_code', 
            'is_checked_in', 
            'purchased_at'
        ]
        read_only_fields = ['id', 'attendee', 'ticket_code', 'is_checked_in', 'purchased_at']

class TicketCheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['is_checked_in']