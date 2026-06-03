import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Storage helpers — abstracted so we can swap to a more secure mechanism later.
// NOTE: localStorage is XSS-vulnerable but is standard for SPA JWT auth.
// To upgrade: move to httpOnly cookies (requires backend Set-Cookie + CSRF).
export const tokenStore = {
  get: () => localStorage.getItem("zivora_token"),
  set: (t) => localStorage.setItem("zivora_token", t),
  clear: () => {
    localStorage.removeItem("zivora_token");
    localStorage.removeItem("zivora_user");
  },
};

const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname.includes("/login") ||
        window.location.pathname.includes("/signup");
      if (!isAuthRoute) {
        tokenStore.clear();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};
