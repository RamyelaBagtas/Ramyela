// routes/pendingUserRoutes.js
const express = require('express');
const router = express.Router();
const PendingUser = require('../models/PendingUser'); // Adjust the path if necessary

router.get('/pendingusers', async (req, res) => {
    try {
        const pendingUsers = await PendingUser.find();
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error('Error fetching pending users:', error);
        res.status(500).json({ error: 'An error occurred while fetching pending users' });
    }
});

module.exports = router;
