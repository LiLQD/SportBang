const adminService = require('../services/admin.service');
const { sendResponse } = require('../utils/response');

const getDashboard = async (req, res) => {
  try {
    const data = await adminService.getDashboard();
    return sendResponse(res, 200, true, 'Admin dashboard retrieved successfully', data);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    return sendResponse(res, 200, true, 'Users retrieved successfully', users);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await adminService.blockUser(req.params.id);
    return sendResponse(res, 200, true, `User ${user.status === 'blocked' ? 'blocked' : 'unblocked'} successfully`, user);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    await adminService.softDeleteUser(req.params.id);
    return sendResponse(res, 200, true, 'User deleted successfully');
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const getAllFields = async (req, res) => {
  try {
    const fields = await adminService.getAllFields();
    return sendResponse(res, 200, true, 'Fields retrieved successfully', fields);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const updateFieldStatus = async (req, res) => {
  try {
    const field = await adminService.updateFieldStatus(req.params.id, req.body.status);
    return sendResponse(res, 200, true, 'Field status updated successfully', field);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await adminService.getAllBookings();
    return sendResponse(res, 200, true, 'Bookings retrieved successfully', bookings);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  blockUser,
  deleteUser,
  getAllFields,
  updateFieldStatus,
  getAllBookings
};
