from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .serializers import UserRegisterSerializer, UserProfileSerializer
# Create your views here.

User = get_user_model() #Assigns the active custom user model to the User variable

class UserViewSet(viewsets.ModalViewSet):
    queryset = User.objects.all()
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegisterSerializer #if a post method then it creates account using the serializer rules for hashing passwords
        return UserProfileSerializer
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
