require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const User = require("../models/User");
const Field = require("../models/Field");

const seedData = async () => {
  try {
    console.log("Đang kết nối tới MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Kết nối thành công!");

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Field.deleteMany({});
    console.log("Đã xóa dữ liệu cũ.");

    // 1. Tạo tài khoản Admin
    const admin = await User.create({
      full_name: "Hệ thống Admin",
      email: "admin@gmail.com",
      phone: "0123456789",
      password: "password123",
      role: "admin"
    });

    // 2. Tạo tài khoản Chủ sân (Owner)
    const owner = await User.create({
      full_name: "Chủ Sân Nguyễn Văn A",
      email: "owner@gmail.com",
      phone: "0987654321",
      password: "password123",
      role: "owner"
    });

    console.log("Đã tạo tài khoản Admin và Owner mẫu.");

    // 3. Tạo danh sách Sân bóng mẫu
    const fields = [
      {
        field_name: "Sân Bóng Mini SportBang A",
        address: "123 Đường Cầu Giấy, Hà Nội",
        field_type: "Sân 7 người",
        price_per_hour: 300000,
        description: "Sân cỏ nhân tạo chất lượng cao, có đèn chiếu sáng ban đêm.",
        amenities: ["Gửi xe", "Nước uống", "Wifi"],
        available_time: [{ start: "06:00", end: "22:00" }],
        owner_id: owner._id,
        images: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000"]
      },
      {
        field_name: "Tổ hợp Thể thao SportBang B",
        address: "456 Đường Láng, Hà Nội",
        field_type: "Sân 5 người",
        price_per_hour: 200000,
        description: "Sân mới khánh thành, mặt cỏ mềm, giảm chấn thương.",
        amenities: ["Gửi xe", "Phòng thay đồ"],
        available_time: [{ start: "05:00", end: "23:00" }],
        owner_id: owner._id,
        images: ["https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2000"]
      }
    ];

    await Field.insertMany(fields);
    console.log("Đã tạo danh sách sân bóng mẫu.");

    console.log("--- HOÀN TẤT SEED DỮ LIỆU ---");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi seed dữ liệu:", error);
    process.exit(1);
  }
};

seedData();
