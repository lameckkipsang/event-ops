from rest_framework import viewsets, permissions
from .models import ServiceCategory, VendorPackage, BookingRequest
from .serializers import (
    ServiceCategorySerializer, 
    VendorPackageSerializer, 
    BookingRequestSerializer
)
from rest_framework.decorators import action

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
    def get_queryset(self):
        """
        Allow filtering packages by tier and category via query parameters.
        For example: /api/marketplace/packages/?tier=PREMIUM&category=2
        """
        queryset = super().get_queryset()
        tier = self.request.query_params.get('tier')
        category = self.request.query_params.get('category')
        
        if tier:
            queryset = queryset.filter(tier=tier.upper())
        if category:
            queryset = queryset.filter(category_id=category)
            
        return queryset

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
        if getattr(user, 'role', None) == 'VENDOR':
            return BookingRequest.objects.filter(package__vendor=user)
        elif getattr(user, 'role', None) == 'ORGANIZER':
            return BookingRequest.objects.filter(organizer=user)
        return BookingRequest.objects.none()
    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        """
        Allows a vendor to ACCEPT or DECLINE a booking request.
        Endpoint: PATCH /api/marketplace/bookings/{id}/status/
        Payload: {"status": "ACCEPTED"} or {"status": "DECLINED"}
        """
        booking = self.get_object()
        user = request.user

        # Ensure only the assigned vendor can update the status
        if booking.package.vendor != user and not user.is_staff:
            return Response(
                {"error": "You are not authorized to update this booking status."},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        if new_status not in [BookingRequest.Status.ACCEPTED, BookingRequest.Status.DECLINED]:
            return Response(
                {"error": "Invalid status. Must be 'ACCEPTED' or 'DECLINED'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = new_status
        booking.save()

        serializer = self.get_serializer(booking)
        return Response({
            "message": f"Booking request successfully marked as {new_status}.",
            "booking": serializer.data
        }, status=status.HTTP_200_OK)