require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const registerSocketHandlers = require('./socketHandler');
const { activeLocks } = require('./ticketStore');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Initialize WebSocket event listeners
registerSocketHandlers(io);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', activeLocks: activeLocks.size });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Live Ops server listening on port ${PORT}`);
});