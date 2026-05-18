const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '7d' } // Tăng lên 7 ngày để test ổn định
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET || 'refreshsecretkey',
    { expiresIn: '30d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken
};
