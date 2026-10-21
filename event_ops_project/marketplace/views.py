from rest_framework import viewsets, permissions
from .models import ServiceCategory, VendorPackage, BookingRequest
from .serializers import (
    ServiceCategorySerializer, 
    VendorPackageSerializer, 
    BookingRequestSerializer
)

# Create your views here.
class IsVendorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow the vendor who created a package to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.vendor == request.user

class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class VendorPackageViewSet(viewsets.ModelViewSet):
    queryset = VendorPackage.objects.all().order_by('-created_at')
    serializer_class = VendorPackageSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsVendorOrReadOnly()]
        return [permissions.AllowAny()]

class BookingRequestViewSet(viewsets.ModelViewSet):
    queryset = BookingRequest.objects.all().order_by('-created_at')
    serializer_class = BookingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter booking requests based on user role so organizers only see their own bookings 
        and vendors only see bookings targeted at their packages.
        """
        user = self.request.user
        if user.is_staff:
            return BookingRequest.objects.all()
        if user.role == 'VENDOR':
            return BookingRequest.objects.filter(package__vendor=user)
        elif user.role == 'ORGANIZER':
            return BookingRequest.objects.filter(organizer=user)
        return BookingRequest.objects.none()