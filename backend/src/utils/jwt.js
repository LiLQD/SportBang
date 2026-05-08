const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '7d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
};

module.exports = {
  generateToken,
  verifyToken
};
