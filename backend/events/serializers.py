from rest_framework import serializers
from .models import Event, EventImage
from tickets.serializers import TicketTierSerializer
from tickets.models import TicketTier, Ticket
from users.models import Notification

class EventImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = EventImage
        fields = ('id', 'image_url', 'uploaded_at')

    def get_image_url(self, obj):
        return obj.image.url if obj.image else None

class EventSerializer(serializers.ModelSerializer):
    organizer_username = serializers.ReadOnlyField(source='organizer.username')
    ticket_tiers = TicketTierSerializer(many=True, required=False)
    images = EventImageSerializer(many=True, read_only=True)
    
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
            'images',
            'created_at'
        )
        read_only_fields = ('id', 'organizer', 'images', 'created_at')

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

    def update(self, instance, validated_data):
        # Extract ticket tiers data if provided in the payload
        tiers_data = validated_data.pop('ticket_tiers', None)

        # Update standard event fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # If ticket tiers were provided in the update payload, update them
        if tiers_data is not None:
            # Clear existing tiers and create new ones (or sync them)
            instance.ticket_tiers.all().delete()
            for tier_data in tiers_data:
                TicketTier.objects.create(event=instance, **tier_data)

        attendee_ids = Ticket.objects.filter(event=instance).values_list('attendee_id', flat=True).distinct()
        for att_id in attendee_ids:
            Notification.objects.create(
                user_id=att_id,
                title="Event Details Changed!",
                message=f"Details for '{instance.title}' have been updated. Click to view.",
                link="/profile"
            )

        return instance