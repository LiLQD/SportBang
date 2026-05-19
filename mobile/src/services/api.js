import { Platform } from "react-native";

let authToken = null;

/**
 * Cập nhật token cho các cuộc gọi API.
 * Được gọi từ AuthStore khi token thay đổi hoặc khi hydrate.
 */
export const setAuthToken = (token) => {
  authToken = token;
};

// Tự động chọn URL dựa trên nền tảng và môi trường
const getBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:3000/api";
  }

  // 1. Ưu tiên dùng Ngrok URL từ file .env (nếu đã cấu hình)
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes("DA_DANG_KY_NGROK")) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Dùng IP dự phòng từ file .env
  if (process.env.EXPO_PUBLIC_FALLBACK_IP) {
    return process.env.EXPO_PUBLIC_FALLBACK_IP;
  }

  // 3. Cuối cùng là giá trị mặc định cứng (fallback cuối cùng)
  return "http://192.168.100.11:3000/api";
};

const BASE_URL = getBaseUrl();

export const apiCall = async (endpoint, options = {}) => {
  const token = authToken;

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

  // Tự động stringify body nếu là object và không phải FormData
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log(`[API] Đang gọi: ${BASE_URL}${endpoint}`);

    // Tạo một controller để có thể hủy request nếu quá lâu
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...config,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

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
