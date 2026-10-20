from django.urls import path, include 
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView,)
from .views import UserViewSet

router = DefaultRouter()
router.register(r'accounts', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
