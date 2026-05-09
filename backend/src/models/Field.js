const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  field_name: {
    type: String,
    required: true,
    trim: true
  },
  images: {
    type: [String],
    default: []
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  map_url: {
    type: String,
    trim: true
  },
  field_type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amenities: {
    type: [String],
    default: []
  },
  price_per_hour: {
    type: Number,
    required: true,
    min: 0
  },
  available_time: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true }
    }
  ],
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  users_rate: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure customers don't see deleted fields by default
fieldSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

fieldSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model('Field', fieldSchema);
