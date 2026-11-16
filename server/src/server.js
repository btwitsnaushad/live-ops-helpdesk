
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const registerSocketHandlers = require('./socketHandler');
const { activeLocks } = require('./ticketStore');

const app = express();
const server = http.createServer(app);

// Configure allowed frontend origins.
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : '*';

// Apply middleware.
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  })
);

app.use(express.json({ limit: '10kb' }));

// Initialize the Socket.IO server.
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Register all real-time ticket and locking events.
registerSocketHandlers(io);

// Health check endpoint for server monitoring.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Live Ops Helpdesk server is running.',
    activeLocks: activeLocks.size,
  });
});

// Handle invalid JSON and other request errors.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'Invalid JSON request body.',
    });
  }

  console.error('Server error:', error.message);

  return res.status(500).json({
    error: 'Internal server error.',
  });
});

// Start the HTTP and WebSocket server.
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Live Ops server listening on port ${PORT}`);
});
