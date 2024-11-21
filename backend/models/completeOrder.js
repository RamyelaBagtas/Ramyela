// completeOrder.js
const mongoose = require('mongoose');

const completeOrderSchema = new mongoose.Schema({
  consumerId: {
      type: String,
      required: true
  },
  product: {
      type: Object,
      required: true
  },
  totalAmount: {
      type: Number,
      required: true
  },
  shipped: {
      type: Boolean,
      default: false
  },
  date: {
      type: Date,
      default: Date.now
  },
  defaultAddress: {
      // Default address schema
      fullName: { type: String, required: true },
      contactNumber: { type: String, required: true },
      region: { type: String, required: true },
      province: { type: String, required: true },
      city: { type: String, required: true },
      barangay: { type: String, required: true },
      postalCode: { type: String, required: true },
      street: { type: String, required: true },
      houseNumber: { type: String, required: true },
      country: { type: String, required: true }
  },
  toReceiveETA: {
      startDate: { type: Date },
      endDate: { type: Date }
  },
  Receive: {
    type: Boolean,
    default: false,
  },
  dateReceived: { // New field to store the date when the order was received
    type: Date
  },
});

const CompleteOrder = mongoose.model('CompleteOrder', completeOrderSchema);

module.exports = CompleteOrder;
