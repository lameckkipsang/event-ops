import uuid
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from django.utils.crypto import get_random_string
from .models import Transaction
from marketplace.models import BookingRequest, VendorPackage
from tickets.models import TicketTier, Ticket
from events.models import Event
from .daraja import initiate_stk_push
from django.conf import settings
from .serializers import TransactionSerializer

class InitiateTicketSTKPushView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tier_id = request.data.get('ticket_tier_id') or request.data.get('booking_id')
        phone_number = request.data.get('phone_number')

        if not tier_id or not phone_number:
            return Response({"error": "ticket_tier_id and phone_number are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tier = TicketTier.objects.get(id=tier_id)
            payment_amount = int(float(request.data.get('amount') or tier.price))
            generated_code = f"EVT-TCK-{uuid.uuid4().hex[:6].upper()}"
            
            ticket_instance = Ticket.objects.create(
                event=tier.event,
                tier=tier,
                attendee=request.user,
                ticket_code=generated_code,
                is_checked_in=False
            )
        except TicketTier.DoesNotExist:
            return Response({"error": "Ticket tier not found."}, status=status.HTTP_404_NOT_FOUND)

        callback_url = getattr(settings, 'MPESA_CALLBACK_URL', '')
        daraja_response = initiate_stk_push(
            phone_number=phone_number,
            amount=payment_amount,
            callback_url=callback_url,
            reference_id=ticket_instance.id
        )

        if daraja_response.get('ResponseCode') == '0':
            transaction, created = Transaction.objects.update_or_create(
                ticket=ticket_instance,
                defaults={
                    'organizer': request.user,
                    'booking': None,
                    'amount': payment_amount,
                    'phone_number': phone_number,
                    'checkout_request_id': daraja_response.get('CheckoutRequestID'),
                    'merchant_request_id': daraja_response.get('MerchantRequestID'),
                    'status': 'PENDING',
                    'escrow_status': 'HELD'
                }
            )
            return Response({
                "message": "STK Push initiated successfully for ticket.",
                "details": daraja_response,
                "transaction_id": transaction.id,
                "ticket_code": ticket_instance.ticket_code
            }, status=status.HTTP_200_OK)

        return Response({"error": "Failed to initiate STK Push.", "details": daraja_response}, status=status.HTTP_400_BAD_REQUEST)


class InitiateVendorBookingSTKPushView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        package_id = request.data.get('package_id') or request.data.get('booking_id')
        event_id = request.data.get('event_id')
        phone_number = request.data.get('phone_number')

        if not package_id or not phone_number:
            return Response({"error": "package_id and phone_number are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Automatically fallback to organizer's event if event_id is not explicitly passed
        if not event_id:
            user_event = Event.objects.filter(organizer=request.user).first()
            if user_event:
                event_id = user_event.id
            else:
                return Response({"error": "event_id is required. Please create an event before booking vendor services."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            package = VendorPackage.objects.get(id=package_id)
            booking_request, created = BookingRequest.objects.get_or_create(
                organizer=request.user,
                package=package,
                event_id=event_id,
                defaults={'status': 'PENDING'}
            )
            payment_amount = int(float(package.price))
        except VendorPackage.DoesNotExist:
            return Response({"error": "Vendor package not found."}, status=status.HTTP_404_NOT_FOUND)

        callback_url = getattr(settings, 'MPESA_CALLBACK_URL', '')
        daraja_response = initiate_stk_push(
            phone_number=phone_number,
            amount=payment_amount,
            callback_url=callback_url,
            reference_id=booking_request.id
        )

        if daraja_response.get('ResponseCode') == '0':
            transaction, created = Transaction.objects.update_or_create(
                booking=booking_request,
                defaults={
                    'organizer': request.user,
                    'ticket': None,
                    'amount': payment_amount,
                    'phone_number': phone_number,
                    'checkout_request_id': daraja_response.get('CheckoutRequestID'),
                    'merchant_request_id': daraja_response.get('MerchantRequestID'),
                    'status': 'PENDING',
                    'escrow_status': 'HELD'
                }
            )
            return Response({
                "message": "STK Push initiated successfully for vendor booking.",
                "details": daraja_response,
                "transaction_id": transaction.id
            }, status=status.HTTP_200_OK)

        return Response({"error": "Failed to initiate STK Push.", "details": daraja_response}, status=status.HTTP_400_BAD_REQUEST)


class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        callback_payload = request.data
        
        try:
            stk_callback = callback_payload.get('Body', {}).get('stkCallback', {})
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')

            transaction_record = Transaction.objects.get(checkout_request_id=checkout_request_id)

            if result_code == 0:
                transaction_record.status = 'COMPLETED'
                
                callback_metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                for item in callback_metadata:
                    if item.get('Name') == 'MpesaReceiptNumber':
                        transaction_record.mpesa_receipt_number = item.get('Value')
                
                transaction_record.save()
            else:
                transaction_record.status = 'FAILED'
                transaction_record.escrow_status = 'CANCELLED'  
                transaction_record.save()

        except Transaction.DoesNotExist:
            return Response({"error": "Transaction record not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as error:
            return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"ResultCode": 0, "ResultDesc": "Success"})


class ReleaseEscrowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, transaction_id):
        try:
            transaction = Transaction.objects.get(id=transaction_id)
            if transaction.status != 'COMPLETED' or transaction.escrow_status != 'HELD':
                return Response({"error": "Transaction is not eligible for escrow release."}, status=status.HTTP_400_BAD_REQUEST)

            booking = transaction.booking
            vendor_user = None
            if booking:
                if hasattr(booking, 'vendor') and hasattr(booking.vendor, 'user'):
                    vendor_user = booking.vendor.user
                elif hasattr(booking, 'package') and hasattr(booking.package, 'vendor'):
                    vendor_user = booking.package.vendor

            vendor_phone = None
            if vendor_user:
                vendor_phone = getattr(vendor_user, 'phone_number', None) or getattr(getattr(vendor_user, 'profile', None), 'phone_number', None)

            if not vendor_phone:
                return Response({"error": "Vendor account does not have a registered phone number for payout."}, status=status.HTTP_400_BAD_REQUEST)

            transaction.escrow_status = 'RELEASED'
            transaction.save()

            return Response({
                "message": "Escrow released successfully. Vendor payout cleared.",
                "transaction_id": transaction.id,
                "escrow_status": transaction.escrow_status,
                "disbursed_to_phone": vendor_phone
            }, status=status.HTTP_200_OK)

        except Transaction.DoesNotExist:
            return Response({"error": "Transaction record not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TransactionHistoryListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Transaction.objects.all().order_by('-created_at')
        if getattr(user, 'role', None) == 'VENDOR':
            return Transaction.objects.filter(booking__package__vendor=user).order_by('-created_at')
        return Transaction.objects.filter(organizer=user).order_by('-created_at')