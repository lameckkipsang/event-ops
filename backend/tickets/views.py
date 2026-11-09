import requests
import base64
from datetime import datetime
from django.conf import settings
from django.shortcuts import render
from django.apps import apps
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from rest_framework.pagination import PageNumberPagination
from .models import Ticket, TicketTier
from events.models import Event
from .serializers import TicketSerializer, TicketCheckInSerializer, TicketTierSerializer, EventSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class TicketPurchaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tier_id = request.data.get('tier')
        
        try:
            tier = TicketTier.objects.get(id=tier_id)
        except TicketTier.DoesNotExist:
            return Response({"error": "Invalid or non-existent ticket tier."}, status=status.HTTP_404_NOT_FOUND)

        if tier.event.organizer == request.user:
            return Response(
                {"error": "Security Exception: You cannot purchase tickets to your own event."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        if tier.quantity_available <= 0:
            return Response({"error": "Tickets for this tier are sold out."}, status=status.HTTP_400_BAD_REQUEST)

        ticket = Ticket.objects.create(
            event=tier.event,
            tier=tier,
            attendee=request.user
        )
        tier.quantity_available -= 1
        tier.save()

        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserTicketListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Ticket.objects.filter(attendee=self.request.user).order_by('-purchased_at')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(purchased_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(purchased_at__date__lte=date_to)
        return queryset

class TicketCheckInView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('ticket_code')
        if not code:
            return Response({"error": "Ticket code is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ticket = Ticket.objects.get(ticket_code=code.strip().upper())
        except Ticket.DoesNotExist:
            return Response({"error": "Invalid ticket code. Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if getattr(user, 'role', None) == 'SECURITY':
            BookingRequest = apps.get_model('marketplace', 'BookingRequest')
            has_event_access = BookingRequest.objects.filter(
                event=ticket.event,
                package__vendor=user,
                status='ACCEPTED'
            ).exists()
            
            if not has_event_access:
                return Response({
                    "error": "Access Denied. You are not assigned to provide security for this specific event."
                }, status=status.HTTP_403_FORBIDDEN)

        if ticket.is_checked_in:
            return Response({
                "error": "This ticket has already been checked in!",
                "checked_in_at": getattr(ticket, 'checked_in_at', None)
            }, status=status.HTTP_400_BAD_REQUEST)

        ticket.is_checked_in = True
        ticket.save()
        
        return Response({
            "message": f"Successfully checked in ticket {ticket.ticket_code}!",
            "attendee": ticket.attendee.username if ticket.attendee else "Unknown",
            "event": ticket.event.title if hasattr(ticket.event, 'title') else str(ticket.event)
        }, status=status.HTTP_200_OK)

class TicketTierListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TicketTierSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return TicketTier.objects.filter(quantity_available__gt=0)

class CheckoutInitiateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ticket_tier_id = request.data.get('ticket_tier_id')
        quantity = int(request.data.get('quantity', 1))
        phone_number = request.data.get('phone_number')

        if not ticket_tier_id or not phone_number:
            return Response(
                {"error": "ticket_tier_id and phone_number are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            tier = TicketTier.objects.get(id=ticket_tier_id)
        except TicketTier.DoesNotExist:
            return Response({"error": "Ticket tier not found."}, status=status.HTTP_404_NOT_FOUND)

        if tier.event.organizer == request.user:
            return Response(
                {"error": "Security Exception: You cannot purchase tickets to your own event."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        total_amount = int(tier.price * quantity)

        consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', None)
        consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', None)
        shortcode = getattr(settings, 'MPESA_SHORTCODE', None)
        passkey = getattr(settings, 'MPESA_PASSKEY', None)
        callback_url = getattr(settings, 'MPESA_CALLBACK_URL', None)

        if not all([consumer_key, consumer_secret, shortcode, passkey]):
            return Response({"error": "M-Pesa configuration missing in settings."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        auth_response = requests.get(api_url, auth=(consumer_key, consumer_secret))
        
        if auth_response.status_code != 200:
            return Response({"error": "Failed to authenticate with Daraja API."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        access_token = auth_response.json().get('access_token')

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = f"{shortcode}{passkey}{timestamp}"
        password = base64.b64encode(data_to_encode.encode()).decode('utf-8')

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

class OrganizerTicketListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = Ticket.objects.all().order_by('-purchased_at')
        else:
            queryset = Ticket.objects.filter(event__organizer=user).order_by('-purchased_at')
            
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(purchased_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(purchased_at__date__lte=date_to)
        return queryset

class EventListView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer
    pagination_class = StandardResultsSetPagination

class OrganizerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        Transaction = apps.get_model('finance', 'Transaction')
        BookingRequest = apps.get_model('marketplace', 'BookingRequest')
        
        events = Event.objects.filter(organizer=user)
        event_data = [{"id": e.id, "title": e.title} for e in events]
        
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        transactions = Transaction.objects.filter(
            ticket__event__organizer=user
        ).select_related('ticket', 'ticket__attendee').order_by('-created_at')
        
        vendor_requests = BookingRequest.objects.filter(
            organizer=user
        ).select_related('package', 'event').order_by('-created_at')
        
        if date_from:
            transactions = transactions.filter(created_at__date__gte=date_from)
            vendor_requests = vendor_requests.filter(created_at__date__gte=date_from)
        if date_to:
            transactions = transactions.filter(created_at__date__lte=date_to)
            vendor_requests = vendor_requests.filter(created_at__date__lte=date_to)
        
        sales_data = []
        total_revenue = 0
        completed_count = 0
        failed_count = 0
        
        for t in transactions:
            attendee = t.ticket.attendee
            phone = t.phone_number or getattr(attendee, 'phone_number', 'N/A')
            email = getattr(attendee, 'email', 'N/A')
            username = getattr(attendee, 'username', 'Unknown')
            
            if t.status == 'COMPLETED':
                total_revenue += t.amount
                completed_count += 1
            elif t.status in ['FAILED', 'CANCELLED']:
                failed_count += 1
                
            sales_data.append({
                "id": t.id,
                "event_title": t.ticket.event.title,
                "ticket_type": t.ticket.tier.ticket_type,
                "amount": t.amount,
                "status": t.status,
                "date": t.created_at if hasattr(t, 'created_at') else t.ticket.purchased_at,
                "attendee_name": username,
                "attendee_email": email,
                "attendee_phone": phone
            })

        vendor_data = []
        for b in vendor_requests:
            vendor_data.append({
                "id": b.id,
                "package_title": b.package.title,
                "package_price": b.package.price,
                "event_title": b.event.title,
                "status": b.status,
                "created_at": b.created_at
            })
            
        return Response({
            "events": event_data,
            "metrics": {
                "total_revenue": total_revenue,
                "completed_sales": completed_count,
                "failed_sales": failed_count
            },
            "sales": sales_data,
            "vendor_bookings": vendor_data
        }, status=status.HTTP_200_OK)