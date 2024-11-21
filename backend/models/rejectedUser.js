const mongoose = require('mongoose');

const rejectedUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userType: { type: String, required: true },
  reasons: {
    dti: { type: Boolean, default: false },
    businessPermit: { type: Boolean, default: false },
    sanitaryPermit: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
});

const RejectedUser = mongoose.model('RejectedUser', rejectedUserSchema);

module.exports = RejectedUser;
