from django.shortcuts import render
from django.views import View
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserRegisterSerializer, UserProfileSerializer, CustomTokenObtainPairSerializer, NotificationSerializer
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from django.utils import timezone

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class LoginView(View):
    def get(self, request):
        return render(request, 'login.html')

class SignupView(View):
    def get(self, request):
        return render(request, 'signup.html')

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

User = get_user_model() 

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegisterSerializer
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

    def post(self, request, *args, **kwargs):
        is_register = request.data.get('is_register', False)
        role = request.data.get('role')

        # dj-rest-auth processes the Google token and creates or logs in the user
        response = super().post(request, *args, **kwargs)
        
        user = getattr(self, 'user', None)
        if not user and request.user.is_authenticated:
            user = request.user

        if user:
            # Check if this user was just created (within the last 10 seconds)
            time_since_joined = (timezone.now() - user.date_joined).total_seconds()
            is_new_user = time_since_joined < 10

            # If they tried to register, but the account already exists, reject it
            if is_register and not is_new_user:
                return Response(
                    {"error": "This Google account is already registered. Please sign in instead."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Only override the role if the user is genuinely new
            if role and is_new_user:
                user.role = role
                user.save(update_fields=['role'])
            
            # Ensure the API response payload reflects the user's correct role
            if 'user' in response.data:
                response.data['user']['role'] = user.role
                
        return response

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user, is_delivered=False).order_by('created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def patch(self, request):
        notification_ids = request.data.get('ids', [])
        if notification_ids:
            Notification.objects.filter(id__in=notification_ids, user=request.user).update(is_delivered=True)
        return Response({"status": "marked as delivered"})

class NotificationHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Notification.objects.filter(user=request.user).order_by('-created_at')
        
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
            
        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = NotificationSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def patch(self, request, pk=None):
        if pk:
            try:
                notification = Notification.objects.get(pk=pk, user=request.user)
                notification.is_read = True
                notification.save(update_fields=['is_read'])
                return Response({"status": "marked as read"}, status=status.HTTP_200_OK)
            except Notification.DoesNotExist:
                return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            return Response({"status": "all marked as read"}, status=status.HTTP_200_OK)