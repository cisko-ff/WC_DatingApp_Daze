const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match');
const auth = require('../middleware/auth');
const upload = require('../utils/imageUpload');
const path = require('path');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    // If updating interests, convert string to array
    if (typeof updates.interests === 'string') {
      updates.interests = updates.interests.split(',').map(i => i.trim()).filter(i => i);
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload profile picture
router.post('/profile/picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profilePicture: fileUrl } },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile picture updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get discovery - users to potentially match with
router.get('/discovery', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Get users that match preferences and haven't been liked/passed
    const excludedIds = [
      req.user._id,
      ...currentUser.likes,
      ...currentUser.passes
    ];

    let query = { _id: { $nin: excludedIds } };

    // Filter by preferred gender
    if (currentUser.preferredGender !== 'all') {
      query.gender = currentUser.preferredGender;
    }

    const users = await User.find(query)
      .select('name age bio photos interests gender location')
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like a user
router.post('/:userId/like', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const likedUser = await User.findById(req.params.userId);

    if (!likedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add to current user's likes
    if (!currentUser.likes.includes(req.params.userId)) {
      currentUser.likes.push(req.params.userId);
      await currentUser.save();
    }

    // Check if it's a mutual like
    const isMatch = likedUser.likes.includes(req.user._id);
    
    if (isMatch) {
      // Create a match
      const match = new Match({
        users: [req.user._id, req.params.userId]
      });
      await match.save();

      // Add to both users' matches
      currentUser.matches.push({
        user: req.params.userId,
        matchedAt: new Date()
      });
      likedUser.matches.push({
        user: req.user._id,
        matchedAt: new Date()
      });
      await currentUser.save();
      await likedUser.save();

      return res.json({ match: true, message: "Match!" });
    }

    res.json({ match: false, message: 'Liked!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pass on a user
router.post('/:userId/pass', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser.passes.includes(req.params.userId)) {
      currentUser.passes.push(req.params.userId);
      await currentUser.save();
    }

    res.json({ message: 'Passed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get matches
router.get('/matches', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('matches.user', 'name photos bio age')
      .select('matches');
    
    res.json(user.matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

