import { Platform } from "react-native";

let authToken = null;

/**
 * Cập nhật token cho các cuộc gọi API.
 * Được gọi từ AuthStore khi token thay đổi hoặc khi hydrate.
 */
export const setAuthToken = (token) => {
  authToken = token;
};

// Tự động chọn URL dựa trên nền tảng đang chạy
const getBaseUrl = () => {
  if (Platform.OS === "web") {
    // Nếu chạy web, dùng localhost và port 3000 của backend
    return "http://localhost:3000/api";
  }
  // Dùng IP của máy tính để điện thoại thật có thể kết nối qua Wi-Fi
  // Đảm bảo IP 192.168.1.98 đúng là IP máy tính của bạn (kiểm tra bằng ipconfig)
  // Đảm bảo port 3000 đã được mở trên Firewall (Tường lửa)
  return "http://192.168.1.98:3000/api";
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
