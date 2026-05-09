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

const deleteField = async (req, res) => {
  try {
    const field = await fieldService.deleteField(req.params.id, req.user);
    return sendResponse(res, 200, true, 'Field deleted successfully', field);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};


const addSlot = async (req, res) => {
  try {
    const field = await fieldService.addSlot(req.params.id, req.body, req.user);
    return sendResponse(res, 201, true, 'Slot added successfully', field);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const updateSlot = async (req, res) => {
  try {
    const field = await fieldService.updateSlot(req.params.id, req.params.slotId, req.body, req.user);
    return sendResponse(res, 200, true, 'Slot updated successfully', field);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const deleteSlot = async (req, res) => {
  try {
    const field = await fieldService.deleteSlot(req.params.id, req.params.slotId, req.user);
    return sendResponse(res, 200, true, 'Slot deleted successfully', field);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendResponse(res, 400, false, 'No images uploaded');
    }
    const field = await fieldService.addImages(req.params.id, req.files, req.user);
    return sendResponse(res, 200, true, 'Images uploaded successfully', field);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const deleteImage = async (req, res) => {
  try {
    const { image_path } = req.body;
    if (!image_path) {
      return sendResponse(res, 400, false, 'image_path is required');
    }
    const field = await fieldService.removeImage(req.params.id, image_path, req.user);
    return sendResponse(res, 200, true, 'Image removed successfully', field);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

module.exports = {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  updateFieldStatus,
  deleteField,
  addSlot,
  updateSlot,
  deleteSlot,
  uploadImages,
  deleteImage
};
