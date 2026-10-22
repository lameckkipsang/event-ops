from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Transaction
from marketplace.models import BookingRequest
from .daraja import initiate_stk_push
from django.conf import settings
from .serializers import InitiatePaymentSerializer

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
            Transaction.objects.create(
                organizer=request.user,
                booking=booking_request,
                amount=payment_amount,
                phone_number=phone_number,
                checkout_request_id=daraja_response.get('CheckoutRequestID'),
                merchant_request_id=daraja_response.get('MerchantRequestID'),
                status='PENDING',
                escrow_status='HELD'
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
