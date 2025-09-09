import axios from "axios";
import toast from "react-hot-toast";
import urls from "@/sharedConstants/urls";
import { emitter } from "./events";

let accessToken = null;
let isRefreshing = false;
let refreshPromise = null; // giữ promise refresh để tránh gọi nhiều lần

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  withCredentials: true, // để server đọc cookie refreshToken
});

// 🔹 Axios riêng cho refresh token (không interceptor để tránh loop)
const rawApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// 🟢 Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🟢 Response Interceptor
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

    // Đang ở trang login thì bỏ qua
    if (window.location.pathname.includes("/login")) {
      return Promise.reject(error);
    }

    // 🔹 Nếu API yêu cầu login thẳng
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

    // 🔹 Nếu cần password/otp riêng cho resource
    if (status === 401 && (data?.requirePassword || data?.requireOtp)) {
      emitter.emit("requireItemAuth", {
        requirePassword: data.requirePassword,
        requireOtp: data.requireOtp,
        itemId: data.itemId,
      });
      if (data?.message) toast.error(data.message);
      return Promise.reject(error);
    }

    // 🔹 Nếu user chưa login (public page)
    if (status === 401 && data?.notLoggedIn) {
      clearAccessToken();
      console.log("ℹ️ Public user: skip refresh");
      return Promise.reject(error);
    }

    // 🔹 Nếu accessToken hết hạn HOẶC thiếu accessToken nhưng có refreshToken
    if (status === 401 && data?.canRefresh) {
      if (originalRequest._retry) {
        // tránh lặp vô tận
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = rawApi
          .post(urls.REFRESH_TOKEN)
          .then((res) => {
            const newToken = res.data?.accessToken;
            if (newToken) {
              setAccessToken(newToken);
            }
            return newToken;
          })
          .catch((refreshError) => {
            console.warn("❌ Refresh token failed:", refreshError);
            const wasLoggedIn = localStorage.getItem("userLoggedIn") === "true";
            clearAccessToken();
            localStorage.removeItem("userLoggedIn");
            // chỉ redirect nếu user đã login
           if (wasLoggedIn) {
              window.location.href = import.meta.env.VITE_FE_URL + "login";
            }
            throw refreshError;
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      try {
        const newToken = await refreshPromise;
        if (newToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        return Promise.reject(e);
      }
    }

    if (status === 401 &&
      (originalRequest?.url?.includes("notifications/count") ||
      originalRequest?.url?.includes("messages/count"))
    ) {
      console.log("ℹ️ Suppressed 401 error for count API:", originalRequest.url);
      return Promise.reject(error);
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

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export default api;
