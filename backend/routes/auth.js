const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-here', {
    expiresIn: '7d'
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, age, gender, preferredGender } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      email: normalizedEmail,
      password,
      name,
      age,
      gender,
      preferredGender: preferredGender || 'all'
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender
      }
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;









