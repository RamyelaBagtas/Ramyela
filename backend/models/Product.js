const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  expirationDate: { // Expiration date for the product
    type: Date,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  stockWithOrder: {
    type: Number,
    default: 0 // Default value if not set
  },
  price: {
    type: Number,
    required: true
  },
  additionalStocks: [{
    addstock: {
      type: Number,
      required: true
    },
    expirationDate: {
      type: Date,
      required: true
    },
    stillAddStock: { // Add this field
      type: Number,
      required: true // If you want to make it mandatory
    },
    createdAt: { // Add this field
      type: Date,
      default: Date.now // Automatically set the creation date
    }
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userType: {
    type: String,
    required: true
  },
  archived: {
    type: Boolean,
    default: false
  },
  displayPictureURL: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
