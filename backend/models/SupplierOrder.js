// models/SupplierOrder.js
const mongoose = require('mongoose');

const supplierOrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supplierproducts: {
      type: Object,
      required: true
    },
    quantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    defaultAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      barangay: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      region: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      contactNumber: { type: String, required: true },
    },
    date: { type: Date, default: Date.now },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'cancelled'], default: 'pending' },
    cancellationReason: { type: String },
    dateCancelled: { type: Date },
    dateAccepted: { type: Date }, // Field to store date when order is accepted
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupplierOrder', supplierOrderSchema);
