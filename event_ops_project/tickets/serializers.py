from rest_framework import serializers
from .models import Ticket, TicketTier
from events.models import Event

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

class TicketPurchaseSerializer(serializers.ModelSerializer):
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all())
    tier = serializers.PrimaryKeyRelatedField(queryset=TicketTier.objects.all())

    class Meta:
        model = Ticket
        fields = ['event', 'tier']

    def validate(self, attrs):
        event = attrs.get('event')
        tier = attrs.get('tier')

        # Ensure the selected ticket tier belongs to the specified event
        if tier.event != event:
            raise serializers.ValidationError(
                {"tier": f"The selected ticket tier '{tier.ticket_type}' does not belong to event '{event.title}'."}
            )

        # Ensure tickets are available
        if tier.quantity_available <= 0:
            raise serializers.ValidationError({"tier": "This ticket tier is sold out."})

        return attrs