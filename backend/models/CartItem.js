const mongoose = require('mongoose');

// Define Mongoose Schema for CartItem
const cartItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, required: true },  // Add orderId field
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: String,
  image: Buffer, // Store image as Buffer
  quantity: String,
  stock: Number,
  price: Number,
  consumerId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
