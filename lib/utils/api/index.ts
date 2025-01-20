import axios from "axios";
const baseURL = process.env.NEXT_PUBLIC_VERA_API_BASE_URL;

const api = axios.create({
  baseURL: `${baseURL}`,
});

api.interceptors.request.use(
  (config) => {
    const localToken = localStorage.getItem("authToken");
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1];

    const Token = localToken || cookieToken;

    if (Token && Token !== "undefined" && Token !== "null") {
      config.headers.Authorization = `Bearer ${Token}`;
      config.headers["Content-Type"] = "application/json";
      config.headers["x-api-key"] = process.env.NEXT_PUBLIC_PRODUCT_API_KEY;
    } else {
      clearAuthTokens();
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
      // console.log("error", error);
      if (status === 401 && data.errors[0].message === "Unauthorized access") {
        // Token has expired, redirect to the login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

const clearAuthTokens = () => {
  localStorage.removeItem("authToken");
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  api.defaults.headers.common["Authorization"] = "";
};

export const destroyToken = clearAuthTokens;

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
