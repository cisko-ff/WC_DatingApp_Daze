const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// Get all matches for current user
router.get('/', auth, async (req, res) => {
  try {
    const matches = await Match.find({ users: req.user._id })
      .populate('users', 'name photos bio age gender')
      .sort({ matchedAt: -1 });
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


