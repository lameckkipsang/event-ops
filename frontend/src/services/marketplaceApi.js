import api from './api';

export const marketplaceService = {
  //Get all categories for filter 
  getCategories: async () => {
    const response = await api.get('marketplace/categories/');
    return response.data;
  },
  //Get packages with optional query params
  getPackages: async (params = {}) => {
    const response = await api.get('marketplace/packages/', { params });
    return response.data;
  },
  //Create a booking request for an event
  createBooking: async (bookingData) => {
    // Expected payload: { event: eventId, package: packageId }
    const response = await api.post('marketplace/bookings/', bookingData);
    return response.data;
  },
  //Get current user's bookings (filtered automatically by backend role)
  getBookings: async () => {
    const response = await api.get('marketplace/bookings/');
    return response.data;
  },
  //Update booking status (For vendors: ACCEPT or DECLINED)
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.patch(`marketplace/bookings/${bookingId}/status/`, { status });
    return response.data;
  }
};