from django.urls import path
from .views import InitiateSTKPushView, MpesaCallbackView, ReleaseEscrowView, TransactionHistoryListView

urlpatterns = [
    path('stk-push/', InitiateSTKPushView.as_view(), name='stk-push'),
    path('mpesa-callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
    path('release-escrow/<int:transaction_id>/', ReleaseEscrowView.as_view(), name='release_escrow'),
    path('transactions/', TransactionHistoryListView.as_view(), name='transaction-history'),
]