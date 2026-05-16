const favoriteService = require('../services/favorite.service');
const { sendResponse } = require('../utils/response');

const toggleFavorite = async (req, res) => {
  try {
    const { fieldId } = req.body;
    if (!fieldId) {
      return sendResponse(res, 400, false, 'Field ID is required');
    }
    const favorites = await favoriteService.toggleFavorite(req.user._id, fieldId);
    return sendResponse(res, 200, true, 'Favorite toggled successfully', favorites);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

const getFavorites = async (req, res) => {
  try {
    const favorites = await favoriteService.getFavorites(req.user._id);
    return sendResponse(res, 200, true, 'Favorites retrieved successfully', favorites);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

module.exports = {
  toggleFavorite,
  getFavorites
};
