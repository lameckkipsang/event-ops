from rest_framework import serializers
from .models import ServiceCategory, VendorPackage, BookingRequest
from users.models import Notification

class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ('id', 'name', 'description')

class VendorPackageSerializer(serializers.ModelSerializer):
    vendor_username = serializers.ReadOnlyField(source='vendor.username')
    vendor_email = serializers.ReadOnlyField(source='vendor.email') # NEW
    vendor_phone = serializers.ReadOnlyField(source='vendor.phone_number') # NEW
    category_name = serializers.ReadOnlyField(source='category.name')
    tier_display = serializers.CharField(source='get_tier_display', read_only=True)

    class Meta:
        model = VendorPackage
        fields = (
            'id', 
            'vendor', 
            'vendor_username',
            'vendor_email',
            'vendor_phone', 
            'category', 
            'category_name', 
            'title',
            'tier',
            'tier_display',
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
    organizer_email = serializers.ReadOnlyField(source='organizer.email') # NEW
    organizer_phone = serializers.ReadOnlyField(source='organizer.phone_number') # NEW

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
            'organizer_email',
            'organizer_phone',
            'status', 
            'created_at'
        )
        read_only_fields = ('id', 'organizer', 'status', 'created_at')

    def create(self, validated_data):
        # Automatically assign the currently logged-in user as the booking organizer
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['organizer'] = request.user
            
        booking = super().create(validated_data)
        
        # Trigger Toast for the Vendor
        Notification.objects.create(
            user=booking.package.vendor,
            title="New Booking Request!",
            message=f"Organizer @{request.user.username} wants to book '{booking.package.title}'. Click to review.",
            link="/vendor/dashboard"
        )
        
        return booking