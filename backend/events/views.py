from rest_framework import viewsets, permissions, generics
from .models import Event
from .serializers import EventSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow the creator/organizer of an event to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:  # safe methods are read-only (GET, HEAD, OPTIONS)
            return True
        return obj.organizer == request.user

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Automatically saves the currently authenticated user as the event organizer
        serializer.save(organizer=self.request.user)

class EventListView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)