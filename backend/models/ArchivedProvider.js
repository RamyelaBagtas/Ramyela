const mongoose = require('mongoose');

const archiveProviderSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthdate: { type: Date, required: true },
  contactNumber: { type: String, required: true },
  userType: { type: String, required: true },
  dtiImageURL: { type: String, required: true },
  businessPermitImageURL: { type: String, required: true },
  sanitaryPermitImageURL: { type: String, required: true },
  archived: {
    type: Boolean,
    default: false
  }
});

const archiveProvider = mongoose.model('archiveProvider', archiveProviderSchema);

module.exports = archiveProvider;
