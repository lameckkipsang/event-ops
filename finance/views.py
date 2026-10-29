from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Transaction
from marketplace.models import BookingRequest
from .daraja import initiate_stk_push
from django.conf import settings
from .serializers import InitiatePaymentSerializer, TransactionSerializer
from rest_framework import generics

# Create your views here.

class InitiateSTKPushView(APIView):
    """
    Initiate Payment (STK Push)
    Triggered when an event organizer submits payment for a vendor booking.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        booking_id = serializer.validated_data['booking_id']
        phone_number = serializer.validated_data['phone_number']

        try:
            booking_request = BookingRequest.objects.get(id=booking_id, organizer=request.user)
        except BookingRequest.DoesNotExist:
            return Response({"error": "Booking request not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

        payment_amount = booking_request.package.price
        
        callback_url = getattr(settings, 'MPESA_CALLBACK_URL', '')

        # Call function from daraja.py
        daraja_response = initiate_stk_push(
            phone_number=phone_number,
            amount=payment_amount,
            callback_url=callback_url,
            reference_id=booking_request.id
        )

        if daraja_response.get('ResponseCode') == '0':
            checkout_request_id = daraja_response.get('CheckoutRequestID')
            merchant_request_id = daraja_response.get('MerchantRequestID')

            transaction, created = Transaction.objects.update_or_create(
                booking=booking_request,
                defaults={
                    'organizer': request.user,
                    'amount': payment_amount,
                    'phone_number': phone_number,
                    'checkout_request_id': checkout_request_id,
                    'merchant_request_id': merchant_request_id,
                    'status': 'PENDING',
                    'escrow_status': 'HELD'
                }
            )
            return Response({
                "message": "STK Push initiated successfully. Check your phone to complete payment.",
                "details": daraja_response
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Failed to initiate STK Push.", "details": daraja_response}, status=status.HTTP_400_BAD_REQUEST)


class MpesaCallbackView(APIView):
    """
    Handle M-Pesa Webhook Callback
    Automatically called by Safaricom servers once the user enters their PIN.
    """
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
    """
    Endpoint to release held escrow funds to the vendor upon event/job completion.
    Fetches vendor account phone number automatically for disbursement.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, transaction_id):
        try:
            # Retrieve the transaction record
            transaction = Transaction.objects.get(id=transaction_id)

            # Ensure payment was completed and funds are currently held in escrow
            if transaction.status != 'COMPLETED' or transaction.escrow_status != 'HELD':
                return Response(
                    {"error": "Transaction is not eligible for escrow release."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Retrieve vendor linked to this booking/transaction
            booking = transaction.booking
            vendor_user = None

            # Look up vendor through booking relationships
            if hasattr(booking, 'vendor') and hasattr(booking.vendor, 'user'):
                vendor_user = booking.vendor.user
            elif hasattr(booking, 'package') and hasattr(booking.package, 'vendor'):
                vendor_user = booking.package.vendor

            # Retrieve vendor phone number from user account or profile
            vendor_phone = None
            if vendor_user:
                vendor_phone = getattr(vendor_user, 'phone_number', None) or getattr(getattr(vendor_user, 'profile', None), 'phone_number', None)

            if not vendor_phone:
                return Response(
                    {"error": "Vendor account does not have a registered phone number for payout."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Mark escrow as released
            transaction.escrow_status = 'RELEASED'
            transaction.save()

            return Response(
                {
                    "message": "Escrow released successfully. Vendor payout cleared.",
                    "transaction_id": transaction.id,
                    "escrow_status": transaction.escrow_status,
                    "disbursed_to_phone": vendor_phone
                },
                status=status.HTTP_200_OK
            )

        except Transaction.DoesNotExist:
            return Response(
                {"error": "Transaction record not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class TransactionHistoryListView(generics.ListAPIView):
    """
    Retrieve transaction and escrow history based on user role.
    Organizers see their own payments, vendors see payments tied to their packages.
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Transaction.objects.all().order_by('-created_at')
        if getattr(user, 'role', None) == 'VENDOR':
            return Transaction.objects.filter(booking__package__vendor=user).order_by('-created_at')
        return Transaction.objects.filter(organizer=user).order_by('-created_at')