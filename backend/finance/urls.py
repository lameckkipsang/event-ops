from django.urls import path
from .views import (
    InitiateTicketSTKPushView,
    InitiateVendorBookingSTKPushView,
    MpesaCallbackView,
    ReleaseEscrowView,
    TransactionHistoryListView
)

urlpatterns = [
    path('stk-push/ticket/', InitiateTicketSTKPushView.as_view(), name='stk-push-ticket'),
    path('stk-push/vendor/', InitiateVendorBookingSTKPushView.as_view(), name='stk-push-vendor'),
    path('mpesa-callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
    path('escrow/release/<int:transaction_id>/', ReleaseEscrowView.as_view(), name='release-escrow'),
    path('transactions/', TransactionHistoryListView.as_view(), name='transaction-history'),
]