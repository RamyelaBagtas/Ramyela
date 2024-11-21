const mongoose = require('mongoose');

const ConsumerSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthdate: { type: Date, required: true },
  contactNumber: { type: String, required: true },
  displayPictureURL: { type: String, required: true },
  userType: { type: String }
});

module.exports = mongoose.model('Consumer', ConsumerSchema);
