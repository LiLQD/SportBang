const { verifyToken } = require('../utils/jwt');
const { sendResponse } = require('../utils/response');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return sendResponse(res, 401, false, 'Not authorized, no token provided');
    }
    
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return sendResponse(res, 401, false, 'Not authorized, user not found');
    }
    
    if (user.status !== 'active') {
      return sendResponse(res, 403, false, 'Account is blocked or inactive');
    }
    
    req.user = user;
    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Not authorized, token failed');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendResponse(res, 403, false, 'Not authorized for this action');
    }
    next();
  };
};

module.exports = { protect, authorize };
