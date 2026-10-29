from django.urls import path, include 
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, CustomTokenObtainPairView, GoogleLogin, LoginView, SignupView, UserProfileView
from dj_rest_auth.views import PasswordResetConfirmView

router = DefaultRouter()
router.register(r'accounts', UserViewSet, basename='user')

urlpatterns = [
    path('accounts/profile/', UserProfileView.as_view(), name='user-profile'),
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # dj-rest-auth base endpoints
    path('auth/', include('dj_rest_auth.urls')),
    # Google OAuth endpoint
    path('auth/google/', GoogleLogin.as_view(), name='rest_google_login'),
    path('login/', LoginView.as_view(), name='login'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('auth/password/reset/confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
]
