import { Platform } from "react-native";
import { useAuthStore } from "../store/auth.store";

// Tự động chọn URL dựa trên nền tảng đang chạy
const getBaseUrl = () => {
  if (Platform.OS === "web") {
    // Nếu chạy web, dùng localhost
    return "http://localhost:3000/api";
  }
  // Nếu chạy Android Emulator, dùng 10.0.2.2
  return "http://10.0.2.2:3000/api";
};

const BASE_URL = getBaseUrl();

export const apiCall = async (endpoint, options = {}) => {
  const token = useAuthStore.getState().token;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    console.log(`[API] Đang gọi: ${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Kiểm tra định dạng phản hồi
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("[API] Server không trả về JSON:", text);
      throw new Error(`Lỗi Server (${response.status}): Server không trả về dữ liệu đúng định dạng.`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ Server: ${response.status}`);
    }

    console.log(`[API] Thành công: ${endpoint}`);
    return data;
  } catch (error) {
    console.error("[API] Lỗi chi tiết:", error);
    // Không hiện window.alert ở đây để tránh lặp thông báo
    throw error;
  }
};
