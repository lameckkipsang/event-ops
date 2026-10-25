from rest_framework import serializers
from django.contrib.auth import get_user_model
import uuid
User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone_number', 'company_name')
    def create(self, validated_data):
        password = validated_data.pop('password') #removes the plain text password out of validated_data so that it can be hashed securely
        # If username is not provided, fallback to using the part of email before '@'
        if not validated_data.get('username'):
            email = validated_data.get('email')
            base_username = email.split('@')[0]
            unique_suffix = uuid.uuid4().hex[:6]
            validated_data['username'] = f"{base_username}_{unique_suffix}"
        user = User(**validated_data) #makes new User object in memory using the remaining clean dict parameters eg username, email, role
        user.set_password(password) #this is where the hashing takes place
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'company_name', 'is_verified')
        read_only_fields = ('id', 'role', 'is_verified')