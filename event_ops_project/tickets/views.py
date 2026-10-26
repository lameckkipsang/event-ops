import requests
from django.conf import settings
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Ticket, TicketTier
from .serializers import TicketSerializer, TicketCheckInSerializer, TicketTierSerializer
# Create your views here.

class TicketPurchaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tier_id = request.data.get('tier')
        
        try:
            tier = TicketTier.objects.get(id=tier_id)
        except TicketTier.DoesNotExist:
            return Response({"error": "Invalid or non-existent ticket tier."}, status=status.HTTP_404_NOT_FOUND)

        # Ensure tickets are available in this tier
        if tier.quantity_available <= 0:
            return Response({"error": "Tickets for this tier are sold out."}, status=status.HTTP_400_BAD_REQUEST)

        # Securely assign event and tier data on the backend
        ticket = Ticket.objects.create(
            event=tier.event,
            tier=tier,
            attendee=request.user
        )
        # Decrement stock count
        tier.quantity_available -= 1
        tier.save()

        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserTicketListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tickets = Ticket.objects.filter(attendee=request.user).order_by('-purchased_at')
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TicketCheckInView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        try:
            ticket = Ticket.objects.get(id=id)
        except Ticket.DoesNotExist:
            return Response({"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        if ticket.is_checked_in:
            return Response({"error": "This ticket has already been checked in."}, status=status.HTTP_400_BAD_REQUEST)

        ticket.is_checked_in = True
        ticket.save()
        
        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TicketTierListView(APIView):
    permission_classes = [permissions.AllowAny] # Anyone can browse ticket tiers

    def get(self, request):
        # Filter only tiers that still have stock available
        tiers = TicketTier.objects.filter(quantity_available__gt=0)
        serializer = TicketTierSerializer(tiers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CheckoutInitiateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ticket_tier_id = request.data.get('ticket_tier_id')
        quantity = int(request.data.get('quantity', 1))
        phone_number = request.data.get('phone_number')  # e.g., "254712345678"

        if not ticket_tier_id or not phone_number:
            return Response(
                {"error": "ticket_tier_id and phone_number are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            tier = TicketTier.objects.get(id=ticket_tier_id)
        except TicketTier.DoesNotExist:
            return Response({"error": "Ticket tier not found."}, status=status.HTTP_404_NOT_FOUND)

        # Calculate total amount
        total_amount = int(tier.price * quantity)

        # M-Pesa STK Push Trigger using Django settings
        consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', None)
        consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', None)
        api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

        auth_response = requests.get(api_url, auth=(consumer_key, consumer_secret))
        access_token = auth_response.json().get('access_token')

        if not access_token:
            return Response({"error": "Failed to authenticate with Daraja API."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "message": "STK Push initiated successfully",
            "details": {
                "ticket_tier": tier.name,
                "quantity": quantity,
                "total_amount": total_amount,
                "phone_number": phone_number
            }
        }, status=status.HTTP_200_OK)