import json
from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from rest_framework import status
from .models import Event, EventImage
from .serializers import EventSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.organizer == request.user

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        images_data = request.FILES.getlist('images')
        
        # Copy the mutable QueryDict so it can unpack the stringified JSON
        data = request.data.copy()
        
        # Parse the stringified ticket tiers from the frontend
        if 'ticket_tiers' in data and isinstance(data['ticket_tiers'], str):
            try:
                data['ticket_tiers'] = json.loads(data['ticket_tiers'])
            except json.JSONDecodeError:
                pass # Let the serializer catch format errors

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        event = serializer.save(organizer=request.user)
        
        for image_file in images_data:
            EventImage.objects.create(event=event, image=image_file)

        headers = self.get_success_headers(serializer.data)
        response_serializer = self.get_serializer(event)
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        data = request.data.copy()
        
        # Parse the stringified ticket tiers during edits
        if 'ticket_tiers' in data and isinstance(data['ticket_tiers'], str):
            try:
                data['ticket_tiers'] = json.loads(data['ticket_tiers'])
            except json.JSONDecodeError:
                pass

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Save the updated standard fields and handle ticket tiers via serializer
        event = serializer.save()

        # Handle new images if the user uploads more during an edit
        images_data = request.FILES.getlist('images')
        if images_data:
            for image_file in images_data:
                EventImage.objects.create(event=event, image=image_file)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
        
    def partial_update(self, request, *args, **kwargs):
        # Forward PATCH requests to the update handler with partial=True
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

class EventListView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer

    def create(self, request, *args, **kwargs):
        images_data = request.FILES.getlist('images')
        
        data = request.data.copy()
        if 'ticket_tiers' in data and isinstance(data['ticket_tiers'], str):
            try:
                data['ticket_tiers'] = json.loads(data['ticket_tiers'])
            except json.JSONDecodeError:
                pass
                
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        event = serializer.save(organizer=request.user)
        
        for image_file in images_data:
            EventImage.objects.create(event=event, image=image_file)

        headers = self.get_success_headers(serializer.data)
        response_serializer = self.get_serializer(event)
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)