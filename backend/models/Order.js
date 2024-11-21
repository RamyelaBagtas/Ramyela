const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  consumerId: String,
  product: Array,
  totalAmount: Number,
  defaultAddress: Object,
  date: Date,
  shippingFee: Number,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
