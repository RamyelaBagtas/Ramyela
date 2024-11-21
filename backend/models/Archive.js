const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  image: Buffer, // Store image as Buffer
  quantity: String,
  stock: Number,
  price: Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming 'User' is your user model name
  }
});

const Archive = mongoose.model('Archive', archiveSchema);

module.exports =Archive;
