const mongoose = require('mongoose');

// Define the schema for the CartOrder
const cartOrdergetSchema = new mongoose.Schema({
  consumerId: {
    type: String,
    required: true
  },
  shipped: {
    type: Boolean,
    default: false
  },
  product: [
    {
      orderId: {
        type: String,
        required: true
      },
      productId: {
        type: String,
        required: true
      },
      userId: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
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
      cancelRequest: {
        type: String,
        default: null
      },
      cancellationReason: {
        type: String,
        default: null
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  defaultAddress: {
    fullName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    region: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String,  },
    barangay: { type: String, required: true },
    postalCode: { type: String, required: true },
    street: { type: String, required: true },
    houseNumber: { type: String, required: true },
    country: { type: String, required: true }
  }
});

// Create a model based on the schema
const CartOrderGet = mongoose.model('CartOrderGet', cartOrdergetSchema);

module.exports = CartOrderGet;
