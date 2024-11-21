const mongoose = require('mongoose');

const PendingUserSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthdate: { type: Date, required: true },
  contactNumber: { type: String, required: true },
  userType: { type: String, required: true },
  address: {
      country: { type: String, required: true },
      region: { type: String, required: true },
      province: { type: String, required: true },
      city: { type: String, required: true },
      barangay: { type: String, required: true },
      coordinates: {
          type: [Number], // Array of numbers for GeoJSON coordinates
          required: true
      }
  },
  displayPictureURL: { type: String, required: true },
  dtiImageURL: { type: String },
  businessPermitImageURL: { type: String },
  sanitaryPermitImageURL: { type: String }
});

module.exports = mongoose.model('PendingUser', PendingUserSchema);
