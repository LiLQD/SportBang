import { Platform } from "react-native";

/**
 * Lấy URL đầy đủ của ảnh.
 * Nếu là link absolute (http...) thì giữ nguyên.
 * Nếu là link relative (/uploads/...) thì nối thêm Domain của Backend.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"; // Ảnh mặc định
  }

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Cấu hình Base URL của Server (không có /api)
  const getServerUrl = () => {
    if (Platform.OS === "web") {
      return "http://localhost:3000";
    }
    return "http://10.0.2.2:3000";
  };

  const baseUrl = getServerUrl();

  // Đảm bảo path bắt đầu bằng /
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  return `${baseUrl}${cleanPath}`;
};
