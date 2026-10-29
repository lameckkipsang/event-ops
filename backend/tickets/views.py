import requests
import base64
from datetime import datetime
from django.conf import settings
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .models import Ticket, TicketTier
from events.models import Event
from .serializers import TicketSerializer, TicketCheckInSerializer, TicketTierSerializer
from tickets.serializers import EventSerializer

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

        total_amount = int(tier.price * quantity)

        #Fetch Daraja Credentials from Django Settings
        consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', None)
        consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', None)
        shortcode = getattr(settings, 'MPESA_SHORTCODE', None)
        passkey = getattr(settings, 'MPESA_PASSKEY', None)
        callback_url = getattr(settings, 'MPESA_CALLBACK_URL', None)

        if not all([consumer_key, consumer_secret, shortcode, passkey]):
            return Response({"error": "M-Pesa configuration missing in settings."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        #Generate OAuth Access Token
        api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        auth_response = requests.get(api_url, auth=(consumer_key, consumer_secret))
        
        if auth_response.status_code != 200:
            return Response({"error": "Failed to authenticate with Daraja API."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        access_token = auth_response.json().get('access_token')

        #Generate STK Push Password & Timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = f"{shortcode}{passkey}{timestamp}"
        password = base64.b64encode(data_to_encode.encode()).decode('utf-8')

        #Send STK Push Request to Safaricom Sandbox
        stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": total_amount,
            "PartyA": phone_number,
            "PartyB": shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": "EventOps",
            "TransactionDesc": f"Payment for {quantity} x {tier.ticket_type}"
        }

        stk_response = requests.post(stk_url, json=payload, headers=headers)
        stk_data = stk_response.json()

        if stk_response.status_code == 200 and stk_data.get('ResponseCode') == '0':
            return Response({
                "message": "STK push sent successfully. Check your phone.",
                "checkout_request_id": stk_data.get('CheckoutRequestID'),
                "merchant_request_id": stk_data.get('MerchantRequestID')
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "error": "M-Pesa STK push failed",
                "details": stk_data
            }, status=status.HTTP_400_BAD_REQUEST)

class OrganizerTicketListView(APIView):
    """
    Allows an organizer to view a list of all tickets purchased 
    by attendees for their specific events.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # If user is staff/admin, let them see all tickets
        if user.is_staff:
            tickets = Ticket.objects.all().order_by('-purchased_at')
        else:
            # Filter tickets where the event belongs to the logged-in organizer
            tickets = Ticket.objects.filter(event__organizer=user).order_by('-purchased_at')
            
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class EventListView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer