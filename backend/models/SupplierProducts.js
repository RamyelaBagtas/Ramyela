const mongoose = require('mongoose');

const WholesaleTierSchema = new mongoose.Schema({
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
}, { _id: false }); // Disable automatic _id creation for subdocuments

const SupplierProductsSchema = new mongoose.Schema({
    productTitle: { type: String, required: true },
    productDescription: { type: String, required: true },
    productImage: { type: Buffer }, // Assuming you're storing images as Buffer
    category: { type: String, required: true },
    preOrder: { type: Boolean, default: true, required: true },
    wholesaleTiers: [{
        minOrder: { type: Number, required: true },
        maxOrder: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
      }],
      materials: [{
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }],
      ingredients: [{
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        price: { type: Number, required: true }
      }],
      procedures: [{
        employee: { type: String, required: true },
        procedure: { type: String, required: true },
      }],
    manufactureDate: { type: Date },
    expirationDate: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userType: { type: String, required: true },
    displayPictureURL: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const SupplierProducts = mongoose.model('SupplierProducts', SupplierProductsSchema);
module.exports = SupplierProducts;
