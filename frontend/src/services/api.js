import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Attach token automatically to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Global response handler: on 401 remove token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("token");
      } catch (e) {
        // ignore
      }
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;