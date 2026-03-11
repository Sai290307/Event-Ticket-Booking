// Centralized API configuration using environment variables

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Events
  EVENTS: `${API_BASE_URL}/api/events`,
  EVENT_BY_ID: (id: string) => `${API_BASE_URL}/api/events/${id}`,
  CREATE_EVENT: `${API_BASE_URL}/api/events`,
  
  // Bookings
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  BOOKINGS_BY_USER: (uid: string) => `${API_BASE_URL}/api/bookings/user/${uid}`,
  BOOKINGS_BY_EVENT: (eventId: string) => `${API_BASE_URL}/api/bookings/event/${eventId}`,
  
  // Users
  USERS: `${API_BASE_URL}/api/users`,
  USER_CHECK: (email: string) => `${API_BASE_URL}/api/users/check?email=${encodeURIComponent(email)}`,
  USER_BY_FIREBASE_ID: (firebaseUid: string) => `${API_BASE_URL}/api/users/firebase/${firebaseUid}`,
  
  // Recommendations
  RECOMMENDATIONS: (uid: string) => `${API_BASE_URL}/api/recommendations/${uid}`,
};

export { API_BASE_URL };

