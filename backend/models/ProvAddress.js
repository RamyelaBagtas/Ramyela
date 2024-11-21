const mongoose = require('mongoose');

const ProvAddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user'
  },
  fullName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  barangay: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  houseNumber: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: false // Optional field for latitude
  },
  longitude: {
    type: Number,
    required: false // Optional field for longitude
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('ProvAddress', ProvAddressSchema);
