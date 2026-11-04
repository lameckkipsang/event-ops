import uuid
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from django.utils.crypto import get_random_string
from .models import Transaction
from marketplace.models import BookingRequest, VendorPackage
from tickets.models import TicketTier, Ticket
from .daraja import initiate_stk_push
from django.conf import settings
from .serializers import InitiatePaymentSerializer, TransactionSerializer

class InitiateSTKPushView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        item_id = serializer.validated_data['booking_id']
        phone_number = serializer.validated_data['phone_number']
        payment_type = request.data.get('type')

        booking_request = None
        ticket_instance = None
        payment_amount = int(float(request.data.get('amount', 1)))

        # Event Ticket Purchase with matching ticket_code generation
        if payment_type == 'event_ticket':
            try:
                tier = TicketTier.objects.get(id=item_id)
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

        # Route 2: Vendor Service Package Booking
        else:
            try:
                booking_request = BookingRequest.objects.get(id=item_id, organizer=request.user)
                payment_amount = int(float(request.data.get('amount') or booking_request.package.price))
            except BookingRequest.DoesNotExist:
                try:
                    package = VendorPackage.objects.get(id=item_id)
                    booking_request, created = BookingRequest.objects.get_or_create(
                        organizer=request.user,
                        package=package,
                        defaults={'status': 'PENDING'}
                    )
                    payment_amount = int(float(package.price))
                except VendorPackage.DoesNotExist:
                    return Response({"error": "Package or booking request not found."}, status=status.HTTP_404_NOT_FOUND)

        callback_url = getattr(settings, 'MPESA_CALLBACK_URL', '')
        reference_id = ticket_instance.id if ticket_instance else (booking_request.id if booking_request else item_id)

        daraja_response = initiate_stk_push(
            phone_number=phone_number,
            amount=payment_amount,
            callback_url=callback_url,
            reference_id=reference_id
        )

        if daraja_response.get('ResponseCode') == '0':
            checkout_request_id = daraja_response.get('CheckoutRequestID')
            merchant_request_id = daraja_response.get('MerchantRequestID')

            transaction = Transaction.objects.create(
                organizer=request.user,
                booking=booking_request,
                ticket=ticket_instance,
                amount=payment_amount,
                phone_number=phone_number,
                checkout_request_id=checkout_request_id,
                merchant_request_id=merchant_request_id,
                status='PENDING',
                escrow_status='HELD'
            )
            return Response({
                "message": "STK Push initiated successfully. Check your phone to complete payment.",
                "details": daraja_response,
                "transaction_id": transaction.id,
                "ticket_code": ticket_instance.ticket_code if ticket_instance else None
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