const authService = require('../services/auth.service');
const { sendResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return sendResponse(res, 201, true, 'Registration successful', user);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse(res, 400, false, 'Please provide email and password');
    }
    
    const data = await authService.login(email, password);
    return sendResponse(res, 200, true, 'Login successful', data);
  } catch (error) {
    const statusCode = error.message === 'Account is blocked' ? 403 : 401;
    return sendResponse(res, statusCode, false, error.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user._id);
    return sendResponse(res, 200, true, 'Profile retrieved successfully', user);
  } catch (error) {
    return sendResponse(res, 404, false, error.message);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
