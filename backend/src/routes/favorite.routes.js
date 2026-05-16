const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', favoriteController.getFavorites);
router.post('/toggle', favoriteController.toggleFavorite);

module.exports = router;
