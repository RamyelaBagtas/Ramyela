const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs'); // Import the fs module
const Gourmet = require('../models/Gourmet');
const DriedFish = require('../models/DriedFish');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

router.post('/products', async (req, res) => {
  try {
    const { productTitle, category, price, weight } = req.body;

    if (!req.files || !req.files.productImage) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!productTitle || !category || !price || !weight) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const productImage = req.files.productImage;
    const uploadPath = path.join(uploadDir, productImage.name);

    productImage.mv(uploadPath, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'File upload failed', error: err });
      }

      const productData = {
        productTitle,
        productImage: uploadPath,
        category,
        weight: JSON.parse(weight),
        price
      };

      if (category === 'gourmet') {
        const newProduct = new Gourmet(productData);
        await newProduct.save();
      } else if (category === 'dried fish') {
        const newProduct = new DriedFish(productData);
        await newProduct.save();
      } else {
        return res.status(400).json({ message: 'Invalid category' });
      }

      res.status(201).json({ message: 'Product added successfully' });
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
