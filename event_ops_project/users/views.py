from django.shortcuts import render
from django.views import View
from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserRegisterSerializer, UserProfileSerializer, CustomTokenObtainPairSerializer
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

# Create your views here.

class LoginView(View):
    def get(self, request):
        return render(request, 'login.html')

class SignupView(View):
    def get(self, request):
        return render(request, 'signup.html')

User = get_user_model() #Assigns the active custom user model to the User variable

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegisterSerializer #if a post method then it creates account using the serializer rules for hashing passwords
        return UserProfileSerializer
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = "http://localhost:8000"
