const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configurable CORS origins (comma-separated list in CORS_ORIGINS)
const configuredCorsOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOriginOption = configuredCorsOrigins.length ? configuredCorsOrigins : true; // true = reflect request origin

const io = socketIo(server, {
  cors: {
    origin: corsOriginOption,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://marasiganfrancis09_db_user:10CHh65BelY2S4rz@cluster0.emcat0y.mongodb.net/?appName=Cluster0';
const path = require('path');

// Middleware
app.use(cors({ origin: corsOriginOption, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/messages', require('./routes/messages'));

// Store io globally for use in routes
global.io = io;

// Socket.io for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log('User joined room:', userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n📋 To fix this:');
    console.log('1. Install MongoDB locally, OR');
    console.log('2. Use MongoDB Atlas (FREE): https://www.mongodb.com/cloud/atlas/register');
    console.log('3. Update MONGODB_URI in backend/.env');
    process.exit(1);
  });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io };
