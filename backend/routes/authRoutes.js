const express = require('express');
const router = express.Router();
const { signupUser } = require('../services/userService');

router.post('/signup', async (req, res) => {
  try {
    const userData = req.body;
    const message = await signupUser(userData);
    res.status(201).json({ message });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
