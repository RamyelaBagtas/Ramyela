const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Consumer = require('../models/Consumer');
const Seller = require('../models/Seller');
const Reseller = require('../models/Reseller');
const Exporter = require('../models/Exporter');
const Supplier = require('../models/Supplier');
const Admin = require('../models/Admin');
const SellersAddress = require('../models/SellersAddress');
const Provider = require('../models/Provider');

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await Consumer.findOne({ email });
        let userType = '';

        if (user) {
            // Check if the consumer is an exporter
            userType = user.userType === 'exporter' ? 'exporter' : 'consumer';
        } else {
            user = await Supplier.findOne({ email });
            if (user) userType = 'supplier';
        }
        if (!user) {
            user = await Admin.findOne({ email });
            if (user) userType = 'admin';
        }
        if (!user) {
            user = await Seller.findOne({ email });
            if (user) userType = 'seller';
        }
        if (!user) {
            user = await Exporter.findOne({ email });
            if (user) userType = 'exporter';
        }
        if (!user) {
            user = await Reseller.findOne({ email });
            if (user) userType = 'reseller';
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Check if the userType is valid
        if (!['consumer', 'supplier', 'admin', 'seller', 'exporter', 'reseller'].includes(userType)) {
            return res.status(400).json({ message: 'Invalid userType' });
        }

        // Return user type and user id in the response
        res.json({
            message: 'Login successful',
            userType,
            email,
            consumerId: user._id,
            isExporter: userType === 'exporter', // Explicitly indicate exporter
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
