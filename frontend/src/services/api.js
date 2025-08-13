import axios from 'axios';
import toast from 'react-hot-toast';
import urls from '@/sharedConstants/urls';
import { emitter } from './events';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
    withCredentials: true,
});

// 🟢 Kiểm tra Request Interceptor
api.interceptors.request.use((config) => {
    return config;
}, (error) => {
    return Promise.reject(error);
});

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

    if (window.location.pathname.includes("/login")) {
      return Promise.reject(error); // đang ở login thì không xử lý
    }

    // Chỉ xử lý 401/403
    if ((status === 401 || status === 403)) {
      // 1. Trường hợp chưa login và API yêu cầu login
      if (data?.requireLogin) {
        console.log("🔐 Emit requireLogin");
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

      // 2. Trường hợp đã login nhưng thiếu password/otp
      if (data?.requirePassword || data?.requireOtp) {
        console.log("🧩 Emit requireItemAuth");
        emitter.emit("requireItemAuth", {
          requirePassword: data.requirePassword,
          requireOtp: data.requireOtp,
          itemId: data.itemId,
        });
        // ✅ Thêm toast ở đây
        if (data?.message) {
          toast.error(data.message);
        }
        return Promise.reject(error);
      }

      // 3. Trường hợp cần refresh token
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
          console.log("✅ Token refreshed. Retrying request...");
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

    // Các lỗi khác
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
