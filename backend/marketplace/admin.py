from django.contrib import admin
from .models import ServiceCategory, VendorPackage, BookingRequest

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(VendorPackage)
class VendorPackageAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'vendor', 'tier', 'price', 'is_available', 'created_at')
    list_filter = ('category', 'tier', 'is_available')
    search_fields = ('title', 'description', 'vendor__username')

@admin.register(BookingRequest)
class BookingRequestAdmin(admin.ModelAdmin):
    list_display = ('event', 'package', 'organizer', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('event__title', 'package__title')