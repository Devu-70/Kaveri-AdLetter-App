const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Required for graceful shutdown
const connectDB = require('./config/db');
const routes = require('./routes');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app); // create HTTP server

// Initialize Socket.IO with CORS config
const io = new Server(server, {
  cors: {
    origin: '*', // Change this to your frontend domain in production
    methods: ['GET', 'POST']
  }
});

// Attach io to app instance for access in controllers
app.set('io', io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Custom Logger (optional)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.send('✅ API is running');
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err.message);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Graceful shutdown for MongoDB
process.on('SIGINT', async () => {
  console.log('\n🛑 Gracefully shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

// Listen to socket connections (optional)
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
