from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    organizer_username = serializers.ReadOnlyField(source='organizer.username')

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
            'created_at'
        )
        read_only_fields = ('id', 'organizer', 'created_at')

    def create(self, validated_data):
        # Automatically assign the currently logged-in user as the event organizer
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['organizer'] = request.user
        return super().create(validated_data)