from rest_framework import serializers
from .models import Ticket, TicketTier
from events.models import Event

class TicketTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketTier
        fields = ['id', 'event', 'ticket_type', 'price', 'quantity_available', 'description']
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

class EventSerializer(serializers.ModelSerializer):
    # Exposes the related ticket_tiers array in GET/POST/PUT requests
    ticket_tiers = TicketTierSerializer(many=True, required=False)

    class Meta:
        model = Event
        fields = '__all__'

    def create(self, validated_data):
        tiers_data = validated_data.pop('ticket_tiers', [])
        event = super().create(validated_data)
        for tier_data in tiers_data:
            TicketTier.objects.create(event=event, **tier_data)
        return event

    def update(self, instance, validated_data):
        tiers_data = validated_data.pop('ticket_tiers', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tiers_data is not None:
            instance.ticket_tiers.all().delete()
            for tier_data in tiers_data:
                TicketTier.objects.create(event=instance, **tier_data)

        return instance