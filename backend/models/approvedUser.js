const mongoose = require('mongoose');

const approvedUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true },
    imageURL: { type: String },
  });


  module.exports = mongoose.model('ApprovedUser', approvedUserSchema);