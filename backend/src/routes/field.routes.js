const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/field.controller');
const { protect, authorize, optionalProtect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', optionalProtect, fieldController.getAllFields);

// Owner routes (Phải đặt trước các route có tham số :id)
router.get('/owner/my-fields', protect, authorize('owner'), fieldController.getMyFields);

// Field detail
router.get('/:id', optionalProtect, fieldController.getFieldById);

// Protected routes (Owner and Admin only)
router.post('/', protect, authorize('owner', 'admin'), fieldController.createField);
router.put('/:id', protect, authorize('owner', 'admin'), fieldController.updateField);
router.patch('/:id/status', protect, authorize('owner', 'admin'), fieldController.updateFieldStatus);
router.delete('/:id', protect, authorize('owner', 'admin'), fieldController.deleteField);

// Slot management
router.post('/:id/slots', protect, authorize('owner', 'admin'), fieldController.addSlot);
router.put('/:id/slots/:slotId', protect, authorize('owner', 'admin'), fieldController.updateSlot);
router.delete('/:id/slots/:slotId', protect, authorize('owner', 'admin'), fieldController.deleteSlot);

// Image management
router.post('/:id/images', protect, authorize('owner', 'admin'), upload.array('images', 10), fieldController.uploadImages);
router.delete('/:id/images', protect, authorize('owner', 'admin'), fieldController.deleteImage);

module.exports = router;

