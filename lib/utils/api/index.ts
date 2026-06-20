import axios from "axios";

/**
 * Axios instance configured for the API proxy
 * Handles routing all requests through the Next.js API route at /api/client
 * Includes support for cookies and proper CORS handling
 */
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "/api/client" // Production path
      : "http://localhost:3000/api/client", // Development path
  withCredentials: true, // Important for secure cookie handling
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
    // Your existing smart logic — keep 100% of this
    if (config.method?.toLowerCase() === "get") {
      config.params = { ...config.params, endpoint: config.url };
      config.url = "";
    } else {
      const contentType = config.headers?.["Content-Type"];
      const contentTypeStr = typeof contentType === "string" ? contentType : "";

      if (
        contentTypeStr.includes("multipart/form-data") ||
        config.data instanceof FormData
      ) {
        config.params = {
          ...config.params,
          endpoint: config.params?.endpoint || config.url,
        };
      } else {
        const originalData = config.data || {};
        config.data = { endpoint: config.url, data: originalData };
      }
      config.url = "";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor that handles:
 * 1. Authentication errors (401) - Redirects to logout
 * 2. Successful responses - Resets redirect tracking
 */
api.interceptors.response.use(
  (response) => {
    isRedirecting = false;
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Handle authentication errors
      if (status === 401) {
        // ✅ Check if we have user data (meaning user was authenticated)
        const userData = localStorage.getItem("user");

        if (userData) {
          // User was authenticated but token expired - redirect to signin
          // Don't clear auth here - let the logout flow handle it
          if (!isRedirecting) {
            isRedirecting = true;
            // ✅ Just redirect, don't clear tokens
            window.location.href = "/signin";
          }
        } else {
          // No user data - not authenticated
          if (!isRedirecting) {
            isRedirecting = true;
            window.location.href = "/signin";
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Clears authentication tokens and redirects to signin
 * This is called when user logs out or authentication errors occur
 */
export const clearAuthTokens = () => {
  if (typeof window !== "undefined") {
    // ✅ Only clear client-side data (localStorage/sessionStorage)
    localStorage.removeItem("user");
    localStorage.removeItem("wallet");
    localStorage.removeItem("verificationStatus");
    localStorage.removeItem("attendantPermissions");
    localStorage.removeItem("hasPin");

    // Also clear sessionStorage
    sessionStorage.clear();

    // ✅ Only clear client-side cookies (not HTTP-only)
    const clientCookies = ["userRole", "userPermissions"];
    clientCookies.forEach((name) => {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    // ❌ DON'T redirect here - let the caller handle it
    // window.location.href = "/signin";
  }
};

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
