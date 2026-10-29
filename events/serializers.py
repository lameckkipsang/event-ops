from rest_framework import serializers
from .models import Event
from tickets.serializers import TicketTierSerializer
from tickets.models import TicketTier

class EventSerializer(serializers.ModelSerializer):
    organizer_username = serializers.ReadOnlyField(source='organizer.username')
    ticket_tiers = TicketTierSerializer(many=True, required=False)
    class Meta:
        model = Event
        fields = (
            'id', 
            'organizer', 
            'organizer_username', 
            'title', 
            'description', 
            'start_date', 
            'end_date', 
            'venue_name', 
            'venue_location', 
            'max_capacity', 
            'ticket_tiers',
            'created_at'
        )
        read_only_fields = ('id', 'organizer', 'created_at')

    def create(self, validated_data):
        # Automatically assign the currently logged-in user as the event organizer
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['organizer'] = request.user
        # Extract ticket tiers data if provided in the payload
        tiers_data = validated_data.pop('ticket_tiers', [])
        
        # Create the event instance
        event = super().create(validated_data)

        # Create each associated ticket tier and link it to this event
        for tier_data in tiers_data:
            TicketTier.objects.create(event=event, **tier_data)

        return event