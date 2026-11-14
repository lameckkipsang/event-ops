from rest_framework import viewsets, permissions
from .models import ServiceCategory, VendorPackage, BookingRequest
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .serializers import (
    ServiceCategorySerializer, 
    VendorPackageSerializer, 
    BookingRequestSerializer
)
from rest_framework.decorators import action
from users.models import Notification

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class IsVendorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.vendor == request.user

class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

class VendorPackageViewSet(viewsets.ModelViewSet):
    queryset = VendorPackage.objects.all().order_by('-created_at')
    serializer_class = VendorPackageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsVendorOrReadOnly()]
        return [permissions.AllowAny()]
        
    def get_queryset(self):
        queryset = super().get_queryset()
        tier = self.request.query_params.get('tier')
        category = self.request.query_params.get('category')
        
        if tier:
            queryset = queryset.filter(tier=tier.upper())
        if category:
            queryset = queryset.filter(category_id=category)
            
        if self.action == 'list':
            queryset = queryset.filter(is_available=True)
            
        return queryset

    def list(self, request, *args, **kwargs):
        """
        Overrides the list method to group vendor packages by company or vendor username.
        This provides a nested JSON response where the top level is the Vendor/Company.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        grouped_data = {}
        for pkg in queryset:
            company = getattr(pkg.vendor, 'company_name', None) or pkg.vendor.username
            if company not in grouped_data:
                grouped_data[company] = {
                    "vendor_id": pkg.vendor.id,
                    "vendor_username": pkg.vendor.username,
                    "company_name": company,
                    "contact_email": getattr(pkg.vendor, 'email', ''),
                    "contact_phone": getattr(pkg.vendor, 'phone_number', ''),
                    "packages": []
                }
            serializer = self.get_serializer(pkg)
            grouped_data[company]["packages"].append(serializer.data)
            
        response_list = list(grouped_data.values())
        
        # Paginate the grouped companies
        page = self.paginate_queryset(response_list)
        if page is not None:
            return self.get_paginated_response(page)
            
        return Response(response_list)

    def destroy(self, request, *args, **kwargs):
        package = self.get_object()
        
        package.is_available = False
        package.title = f"{package.title} [DISCONTINUED]"
        package.save()
        
        return Response(
            {"message": "Service package discontinued. Existing organizers retain booking visibility."}, 
            status=status.HTTP_204_NO_CONTENT
        )

class BookingRequestViewSet(viewsets.ModelViewSet):
    queryset = BookingRequest.objects.all().order_by('-created_at')
    serializer_class = BookingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if user.is_staff:
            queryset = BookingRequest.objects.all()
        # Allow SECURITY role to fetch incoming booking requests alongside VENDOR
        elif getattr(user, 'role', None) in ['VENDOR', 'SECURITY']:
            queryset = BookingRequest.objects.filter(
                package__vendor=user,
                transaction__status='COMPLETED'
            )
        elif getattr(user, 'role', None) == 'ORGANIZER':
            queryset = BookingRequest.objects.filter(organizer=user)
        else:
            queryset = BookingRequest.objects.none()
            
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
            
        return queryset
        
    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        booking = self.get_object()
        user = request.user

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

        Notification.objects.create(
            user=booking.organizer,
            title="Booking Update",
            message=f"Vendor @{user.username} has {new_status.lower()} your booking for '{booking.package.title}'.",
            link="/organizer/bookings"
        )

        serializer = self.get_serializer(booking)
        return Response({
            "message": f"Booking request successfully marked as {new_status}.",
            "booking": serializer.data
        }, status=status.HTTP_200_OK)