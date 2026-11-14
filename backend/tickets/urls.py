from django.urls import path
from .views import TicketPurchaseView, UserTicketListView, TicketCheckInView, TicketTierListView, CheckoutInitiateView, OrganizerTicketListView, OrganizerDashboardView

app_name = 'tickets'

urlpatterns = [
    path('', TicketTierListView.as_view(), name='ticket-tier-list'),
    path('purchase/', TicketPurchaseView.as_view(), name='ticket-purchase'),
    path('my-tickets/', UserTicketListView.as_view(), name='user-tickets'),
    path('organizer/tickets/', OrganizerTicketListView.as_view(), name='organizer-tickets'),
    path('check-in/', TicketCheckInView.as_view(), name='ticket-check-in'),    
    path('checkout/', CheckoutInitiateView.as_view(), name='checkout_initiate'),
    path('organizer/dashboard/', OrganizerDashboardView.as_view(), name='organizer-dashboard'),
]