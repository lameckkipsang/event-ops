from rest_framework import serializers
from .models import ServiceCategory, VendorPackage, BookingRequest

class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ('id', 'name', 'description')

class VendorPackageSerializer(serializers.ModelSerializer):
    vendor_username = serializers.ReadOnlyField(source='vendor.username')
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = VendorPackage
        fields = (
            'id', 
            'vendor', 
            'vendor_username', 
            'category', 
            'category_name', 
            'title', 
            'description', 
            'price', 
            'is_available', 
            'created_at'
        )
        read_only_fields = ('id', 'vendor', 'created_at')

    def create(self, validated_data):
        # Automatically assign the currently logged-in user as the package vendor
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['vendor'] = request.user
        return super().create(validated_data)

class BookingRequestSerializer(serializers.ModelSerializer):
    package_title = serializers.ReadOnlyField(source='package.title')
    event_title = serializers.ReadOnlyField(source='event.title')
    organizer_username = serializers.ReadOnlyField(source='organizer.username')

    class Meta:
        model = BookingRequest
        fields = (
            'id', 
            'event', 
            'event_title', 
            'package', 
            'package_title', 
            'organizer', 
            'organizer_username', 
            'status', 
            'created_at'
        )
        read_only_fields = ('id', 'organizer', 'status', 'created_at')

    def create(self, validated_data):
        # Automatically assign the currently logged-in user as the booking organizer
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['organizer'] = request.user
        return super().create(validated_data)