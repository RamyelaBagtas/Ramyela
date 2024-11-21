const express = require('express');
const router = express.Router();

// Consumer route
router.get('/consumer', (req, res) => {
  res.send('Welcome, Consumer!');
});

// Seller route
router.get('/seller', (req, res) => {
  res.send('Welcome, Seller!');
});

// Exporter route
router.get('/exporter', (req, res) => {
  res.send('Welcome, Exporter!');
});

// Reseller route
router.get('/reseller', (req, res) => {
  res.send('Welcome, Reseller!');
});

router.get('/supplier', (req, res) => {
  res.send('Welcome, Supplier!');
});

// Admin route
router.get('/admin', (req, res) => {
  res.send('Welcome, Admin!');
});

module.exports = router;
