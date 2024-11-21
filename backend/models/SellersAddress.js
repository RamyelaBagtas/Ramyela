const mongoose = require('mongoose');

const SellersAddressSchema = new mongoose.Schema({
    userId: {  // Refers to either Seller or Reseller
        type: mongoose.Schema.Types.ObjectId,
        required: true
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
  coordinates: {
    type: [Number], // Array of numbers for GeoJSON coordinates
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

SellersAddressSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model('SellersAddress', SellersAddressSchema);
