const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  field_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  booking_date: {
    type: Date,
    required: true
  },
  booking_slot: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  total_price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'confirmed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
