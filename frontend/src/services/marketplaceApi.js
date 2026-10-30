import api from './api';

export const marketplaceService = {
  //Get all categories for filter 
  getCategories: async () => {
    const response = await api.get('categories/');
    return response.data;
  },
  //Get packages with optional query params
  getPackages: async (params = {}) => {
    const response = await api.get('packages/', { params });
    return response.data;
  },
  //Create a booking request for an event
  createBooking: async (bookingData) => {
    // Expected payload: { event: eventId, package: packageId }
    const response = await api.post('bookings/', bookingData);
    return response.data;
  },
  //Get current user's bookings (filtered automatically by backend role)
  getBookings: async () => {
    const response = await api.get('bookings/');
    return response.data;
  },
  //Update booking status (For vendors: ACCEPT or DECLINED)
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.patch(`bookings/${bookingId}/status/`, { status });
    return response.data;
  }
};