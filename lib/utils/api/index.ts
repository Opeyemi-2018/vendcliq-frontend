import axios from "axios";
const baseURL = process.env.NEXT_PUBLIC_VERA_API_BASE_URL;

const api = axios.create({
  baseURL: `${baseURL}`,
});

api.interceptors.request.use(
  (config) => {
    const Token = localStorage.getItem("authToken");
    console.log("Token>>>", Token);
    if (Token && Token !== "undefined" && Token !== "null") {
      console.log(Token);
      config.headers.Authorization = `Bearer ${Token}`;
    } else {
      localStorage.removeItem("authToken");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add an interceptor to handle response errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (
        status === 401 &&
        data.message === "An error occurred - Token Expired"
      ) {
        // Token has expired, redirect to the login page
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export const destroyToken = () => {
  try {
    // Remove token from localStorage
    localStorage.removeItem("authToken");

    // Clear Authorization header from axios instance
    api.defaults.headers.common["Authorization"] = "";

    // Optional: Clear any other auth-related data you might have
    // localStorage.removeItem("user");
    // localStorage.removeItem("refreshToken");

    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    return false;
  }
};

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
