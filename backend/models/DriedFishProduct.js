const mongoose = require('mongoose');

const driedFishProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: String,
  image: {
    type: Buffer,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userType: { // New field to store the user's type
    type: String,
    required: true
  },
  displayPictureURL: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  archived: {
    type: Boolean,
    default: false
  }
});

const DriedFishProduct = mongoose.model('DriedFishProduct', driedFishProductSchema);

module.exports = DriedFishProduct;
