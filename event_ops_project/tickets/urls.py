from django.urls import path
from .views import TicketPurchaseView, UserTicketListView, TicketCheckInView

app_name = 'tickets'

urlpatterns = [
    path('purchase/', TicketPurchaseView.as_view(), name='ticket-purchase'),
    path('my-tickets/', UserTicketListView.as_view(), name='user-tickets'),
    path('<uuid:id>/check-in/', TicketCheckInView.as_view(), name='ticket-check-in'),
]