import axios from 'axios';
import toast from 'react-hot-toast';
import urls from '@/sharedConstants/urls';
import { emitter } from './events';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  withCredentials: true,
});

// 🟢 Request Interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

let isRefreshing = false;

api.interceptors.response.use(
  (response) => {
    const change = response.data?.pointsChange;
    if (change) {
      if (change > 50) {
        emitter.emit("changePoints", change);
      } else {
        toast((change > 0 ? "+" : "") + change, {
          icon: change > 0 ? "🎉" : "💔",
        });
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const data = error.response?.data;

    console.log("❌ Interceptor caught error:", status, data);

    // đang ở login page thì bỏ qua
    if (window.location.pathname.includes("/login")) {
      return Promise.reject(error);
    }

    // 🔹 Nếu API yêu cầu login
    if (status === 401 && data?.requireLogin) {
      emitter.emit("requireLogin", {
        redirectUrl: window.location.pathname + window.location.search,
        nextStep: {
          requirePassword: data.requirePassword,
          requireOtp: data.requireOtp,
          itemId: data.itemId,
        },
      });
      return Promise.reject(error);
    }

    // 🔹 Nếu cần password/otp cho resource
    if (status === 401 && (data?.requirePassword || data?.requireOtp)) {
      emitter.emit("requireItemAuth", {
        requirePassword: data.requirePassword,
        requireOtp: data.requireOtp,
        itemId: data.itemId,
      });
      if (data?.message) toast.error(data.message);
      return Promise.reject(error);
    }

    // 🔹 Chỉ refresh token khi 401
    if (status === 401) {
      const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
      if (!isLoggedIn) {
        console.warn("❌ Not logged in, skip refresh-token");
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await api.post(urls.REFRESH_TOKEN);
          isRefreshing = false;
          console.log("✅ Token refreshed. Retrying request once...");
          // retry đúng 1 lần
          originalRequest._retry = true;
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          console.warn("❌ Refresh failed, redirect to login.");
          localStorage.removeItem("userLoggedIn");
          window.location.href = import.meta.env.VITE_FE_URL + "login";
          return Promise.reject(refreshError);
        }
      }
    }

    // 🔹 Nếu là 403 => không refresh, chỉ báo lỗi
    if (status === 403) {
      toast.error(data?.message || "Bạn không có quyền truy cập");
      return Promise.reject(error);
    }

    // 🔹 Các lỗi khác
    const message =
      data?.message || data?.error || error.message || "Unknown error";
    if (
      message.includes("PayloadTooLargeError") ||
      message.includes("request entity too large")
    ) {
      toast.error("The data you sent is too large. Please optimize it.");
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
