const mongoose = require('mongoose');

const cancelOrderSchema = new mongoose.Schema({
  consumerId: {
    type: String,
    required: true
  },
  product: {
    type: Object, // Define the schema for the product as needed
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  canceled: {
    type: Boolean,
    default: true // Default to true for canceled orders
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cancellationReason: {
    type: String,
    required: true // Make this required if it's necessary to always have a reason
  }
});

const CancelOrder = mongoose.model('CancelOrder', cancelOrderSchema);

module.exports = CancelOrder;
