import axios from "axios";

/**
 * Axios instance configured for the API proxy
 * Handles routing all requests through the Next.js API route at /api/client
 * Includes support for cookies and proper CORS handling
 */
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api/client'  // Production path
    : 'http://localhost:3000/api/client', // Development path
  withCredentials: true // Important for secure cookie handling
});

// Track if we're already redirecting to prevent redirect loops
let isRedirecting = false;

/**
 * Request interceptor that handles:
 * 1. GET requests - Moves the endpoint to query parameters
 * 2. POST/PUT/DELETE requests:
 *    - For multipart/form-data: Preserves FormData and adds endpoint to query params
 *    - For JSON requests: Wraps data in an object with endpoint
 * 
 * This allows the Next.js API route to properly handle both JSON and multipart requests
 * while maintaining a consistent interface for endpoint routing.
 */
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
      // For POST/PUT/DELETE requests
      const contentType = config.headers?.['Content-Type'];
      const contentTypeStr = typeof contentType === 'string' ? contentType : '';
      
      if (contentTypeStr.includes('multipart/form-data') || (config.data instanceof FormData)) {
        // For multipart/form-data, ensure endpoint is in params and preserve FormData
        config.params = {
          ...config.params,
          endpoint: config.params?.endpoint || config.url
        };
      } else {
        // For JSON requests, include endpoint in body
        const originalData = config.data || {};
        config.data = {
          endpoint: config.url,
          data: originalData
        };
      }
      config.url = ''; // Clear the URL as it's now in body or params
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor that handles:
 * 1. Authentication errors (401) - Redirects to logout
 * 2. Successful responses - Resets redirect tracking
 * 
 * This ensures proper session handling and prevents redirect loops
 */
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

/**
 * Clears authentication tokens and redirects to logout
 * This is called when authentication errors occur
 */
const clearAuthTokens = () => {
  // Redirect to logout endpoint which will clear the cookie and redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/api/auth/logout';
  }
};

export { clearAuthTokens };
export default api;

/**
 * Starts a countdown timer for OTP verification
 * @param callback Function to call with remaining time
 * @returns Cleanup function to clear the timer
 */
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
