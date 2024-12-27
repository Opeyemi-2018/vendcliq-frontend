import axios from "axios";
const baseURL = process.env.NEXT_PUBLIC_VERA_API_BASE_URL;

const api = axios.create({
  baseURL: `${baseURL}`,
});

api.interceptors.request.use(
  (config) => {
    const localToken = localStorage.getItem("authToken");
    const localRefreshToken = localStorage.getItem("refreshToken");
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1];
    const cookieRefreshToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("refreshToken="))
      ?.split("=")[1];

    const Token = localToken || cookieToken;
    const RefreshToken = localRefreshToken || cookieRefreshToken;

    if (Token && Token !== "undefined" && Token !== "null") {
      config.headers.Authorization = `Bearer ${Token}`;
      config.headers["Content-Type"] = "application/json";
    } else if (
      RefreshToken &&
      RefreshToken !== "undefined" &&
      RefreshToken !== "null"
    ) {
      // If no valid auth token but have refresh token, try to refresh
      refreshAuthToken(RefreshToken);
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
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const { status, data } = error.response;

      // Handle token expiration
      if (
        status === 401 &&
        data.message === "An error occurred - Token Expired" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const refreshToken =
          localStorage.getItem("refreshToken") ||
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("refreshToken="))
            ?.split("=")[1];

        if (refreshToken) {
          try {
            const newToken = await refreshAuthToken(refreshToken);
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            clearAuthTokens();
            window.location.href = "/auth/login";
            return Promise.reject(refreshError);
          }
        }

        clearAuthTokens();
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

const refreshAuthToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(`${baseURL}/auth/refresh`, {
      refreshToken,
    });

    const newToken = response.data.token;

    // Update tokens in storage
    localStorage.setItem("authToken", newToken);
    document.cookie = `authToken=${newToken}; path=/`;

    return newToken;
  } catch (error) {
    clearAuthTokens();
    throw error;
  }
};

const clearAuthTokens = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
