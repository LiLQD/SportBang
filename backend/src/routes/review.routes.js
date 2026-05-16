const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/field/:fieldId', reviewController.getFieldReviews);

router.post('/', protect, reviewController.createReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
