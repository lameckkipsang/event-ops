from django.contrib import admin
from .models import ServiceCategory, ServicePackage

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(ServicePackage)
class ServicePackageAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'vendor', 'price', 'created_at')
    list_filter = ('category', 'tier')
    search_fields = ('title', 'description')