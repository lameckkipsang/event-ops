from rest_framework import serializers
from django.contrib.auth import get_user_model
import uuid
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import Notification
from dj_rest_auth.serializers import PasswordResetSerializer

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone_number', 'company_name')
    def create(self, validated_data):
        password = validated_data.pop('password')
        if not validated_data.get('username'):
            email = validated_data.get('email')
            base_username = email.split('@')[0]
            unique_suffix = uuid.uuid4().hex[:6]
            validated_data['username'] = f"{base_username}_{unique_suffix}"
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'company_name', 'is_verified')
        read_only_fields = ('id', 'role', 'is_verified')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError("No active account found with the given credentials.")
            refresh = self.get_token(user)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'username': user.username,
                'role': user.role
            }
        raise serializers.ValidationError("Must include 'email' and 'password'.")

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class CustomPasswordResetSerializer(PasswordResetSerializer):
    def get_email_options(self):
        # This forces the email link to use your Vercel frontend domain
        return {
            'domain_override': 'eventops-one.vercel.app',
        }