import axios from "axios";

// Create axios instance for proxy
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api/client'  // Production path
    : 'http://localhost:3000/api/client', // Development path
  withCredentials: true // Important for secure cookie handling
});

// Track if we're already redirecting to prevent redirect loops
let isRedirecting = false;

api.interceptors.request.use(
  (config) => {
    // For GET requests, add endpoint as query parameter
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        endpoint: config.url
      };
      config.url = ''; // Clear the URL as it's now in params
    } else {
      // For POST/PUT/DELETE requests, include endpoint in body
      const originalData = config.data || {};
      config.data = {
        endpoint: config.url,
        data: originalData
      };
      config.url = ''; // Clear the URL as it's now in body
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add an interceptor to handle response errors
api.interceptors.response.use(
  (response) => {
    // Reset redirecting flag on successful response
    isRedirecting = false;
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        // Prevent redirect loops
        if (!isRedirecting) {
          isRedirecting = true;
          clearAuthTokens();
        }
      }
    }
    return Promise.reject(error);
  }
);

const clearAuthTokens = () => {
  // Redirect to logout endpoint which will clear the cookie and redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/api/auth/logout';
  }
};

export { clearAuthTokens };
export default api;

export const startOtpTimer = (callback: (timeLeft: number) => void) => {
  let timeLeft = 30;

  const timer = setInterval(() => {
    timeLeft--;
    callback(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timer);
    }
  }, 1000);

  return () => clearInterval(timer);
};
