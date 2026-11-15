"""
URL configuration for event_ops_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('reset-password/<uidb64>/<token>/', TemplateView.as_view(), name='password_reset_confirm'),
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('events.urls')),
    path('api/', include('marketplace.urls')),
    path('api/finance/', include('finance.urls')),
    path('api/tickets/', include('tickets.urls')),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('accounts/', include('allauth.urls')),
]

# This tells Django to serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)