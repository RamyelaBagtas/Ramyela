const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  consumerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer'
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

AddressSchema.index({ coordinates: "2dsphere" })

module.exports = mongoose.model('Address', AddressSchema);