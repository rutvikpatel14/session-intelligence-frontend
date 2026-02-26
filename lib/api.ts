import axios, { AxiosHeaders, type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { clearAuthState, getAccessToken, getCsrfToken, setAccessToken, setCsrfToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

interface ErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

let isRefreshing = false;
const pendingRequests: Array<(token: string | null) => void> = [];

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const authClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = new AxiosHeaders(config.headers ?? {});
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }

 const csrf = getCsrfToken() ?? Cookies.get("csrfToken");
  if (csrf && config.method && ["post", "put", "patch", "delete"].includes(config.method)) {
    config.headers = new AxiosHeaders(config.headers ?? {});
    (config.headers as AxiosHeaders).set("x-csrf-token", csrf);
  }

  return config;
});

async function refreshAccessToken() {
  if (isRefreshing) {
    return new Promise<string | null>((resolve) => {
      pendingRequests.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const csrf = getCsrfToken() ?? Cookies.get("csrfToken");
    const response = await authClient.post(
      "/auth/refresh",
      {},
      {
        headers: csrf
          ? {
              "x-csrf-token": csrf,
            }
          : undefined,
      }
    );

    const { accessToken, csrfToken } = response.data as {
      accessToken: string;
      csrfToken: string;
    };

    setAccessToken(accessToken);
    setCsrfToken(csrfToken);

    pendingRequests.forEach((cb) => cb(accessToken));
    pendingRequests.length = 0;

    return accessToken;
  } catch (error) {
    pendingRequests.forEach((cb) => cb(null));
    pendingRequests.length = 0;
    clearAuthState();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw error;
  } finally {
    isRefreshing = false;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    const status = error.response?.status;
    const code = error.response?.data?.error?.code;

    if (
      status === 403 &&
      (code === "REFRESH_TOKEN_REUSE_DETECTED" || code === "SESSION_VERIFICATION_REQUIRED")
    ) {
      clearAuthState();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/login") {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          return Promise.reject(error);
        }

        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${newToken}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api, authClient };

