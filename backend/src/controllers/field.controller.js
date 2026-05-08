const fieldService = require('../services/field.service');
const { sendResponse } = require('../utils/response');

const getAllFields = async (req, res) => {
  try {
    const fields = await fieldService.getAllFields(req.query, req.user);
    return sendResponse(res, 200, true, 'Fields retrieved successfully', fields);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const getFieldById = async (req, res) => {
  try {
    const field = await fieldService.getFieldById(req.params.id, req.user);
    return sendResponse(res, 200, true, 'Field retrieved successfully', field);
  } catch (error) {
    return sendResponse(res, 404, false, error.message);
  }
};

const createField = async (req, res) => {
  try {
    const field = await fieldService.createField(req.body, req.user.id);
    return sendResponse(res, 201, true, 'Field created successfully', field);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const updateField = async (req, res) => {
  try {
    const field = await fieldService.updateField(req.params.id, req.body, req.user);
    return sendResponse(res, 200, true, 'Field updated successfully', field);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const updateFieldStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return sendResponse(res, 400, false, 'Status is required');
    }
    const field = await fieldService.updateFieldStatus(req.params.id, status, req.user);
    return sendResponse(res, 200, true, 'Field status updated successfully', field);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

module.exports = {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  updateFieldStatus
};
