const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

const register = async (payload) => {
  const { full_name, email, phone, password, role } = payload;

  // 1. Kiểm tra xem email này đã tồn tại chưa
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.isDeleted) {
      // Nếu tài khoản đã bị xóa trước đó, ta xóa hẳn record cũ để cho phép đăng ký mới
      await User.deleteOne({ _id: existingUser._id });
      console.log(`[AUTH] Deleted old soft-deleted record for email: ${email}`);
    } else {
      // Nếu tài khoản đang hoạt động thì báo lỗi
      throw new Error('Email này đã được đăng ký sử dụng');
    }
  }

  // 2. Tạo tài khoản mới
  const user = await User.create({
    full_name,
    email,
    phone,
    password,
    role: role || 'customer'
  });

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  return userWithoutPassword;
};

const login = async (email, password) => {
  const user = await User.findOne({ email, isDeleted: { $ne: true } }).select('+password');
  
  if (!user) {
    throw new Error('Tài khoản không tồn tại hoặc đã bị xóa');
  }

  if (user.status !== 'active') {
    throw new Error('Tài khoản của bạn đã bị khóa');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Lưu refresh token vào database để có thể revoke sau này
  user.refresh_token = refreshToken;
  await user.save();

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;
  delete userWithoutPassword.refresh_token;

  return {
    user: userWithoutPassword,
    token,
    refreshToken
  };
};

const logout = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    user.refresh_token = null;
    await user.save();
  }
  return { message: 'Logged out successfully' };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Get real stats
  const bookingCount = await Booking.countDocuments({ user_id: userId });
  const favoriteCount = user.favorites ? user.favorites.length : 0;

  // Calculate total spent
  const payments = await Payment.find({ payment_status: 'paid' }).populate({
    path: 'booking_id',
    match: { user_id: userId }
  });

  const totalSpent = payments
    .filter(p => p.booking_id !== null)
    .reduce((sum, p) => sum + p.amount, 0);

  const userObj = user.toObject();
  userObj.stats = {
    bookings: bookingCount,
    favorites: favoriteCount,
    spent: totalSpent
  };

  return userObj;
};

const updateProfile = async (userId, payload) => {
  const { full_name, phone } = payload;

  const user = await User.findByIdAndUpdate(
    userId,
    { full_name, phone },
    { returnDocument: 'after', runValidators: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const changePassword = async (userId, payload) => {
  const { oldPassword, newPassword } = payload;

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new Error('Mật khẩu cũ không chính xác');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Đổi mật khẩu thành công' };
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword
};
