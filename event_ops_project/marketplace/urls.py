from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceCategoryViewSet, VendorPackageViewSet, BookingRequestViewSet

router = DefaultRouter()
router.register(r'categories', ServiceCategoryViewSet, basename='service-category')
router.register(r'packages', VendorPackageViewSet, basename='vendor-package')
router.register(r'bookings', BookingRequestViewSet, basename='booking-request')

urlpatterns = [
    path('', include(router.urls)),
]