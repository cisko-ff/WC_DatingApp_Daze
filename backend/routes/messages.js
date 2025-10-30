const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// Get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'name photos profilePicture')
      .populate('receiver', 'name photos profilePicture')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/:userId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Check if users are matched
    const match = await Match.findOne({
      users: { $all: [req.user._id, req.params.userId] }
    });

    if (!match) {
      return res.status(403).json({ error: 'Users are not matched' });
    }

    const message = new Message({
      sender: req.user._id,
      receiver: req.params.userId,
      content
    });

    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name photos profilePicture')
      .populate('receiver', 'name photos profilePicture');
    
    // Emit to Socket.io
    if (global.io) {
      global.io.to(req.params.userId).emit('receive-message', populatedMessage);
    }
    
    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/:userId/read', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

