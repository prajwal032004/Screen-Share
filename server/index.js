require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bonjour = require('bonjour')();
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { getNetworkInterfaces } = require('./networkUtils');

const SIGNAL_PORT = process.env.SIGNAL_PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 100,
});
app.use('/api/', apiLimiter);

// For local REST fallback checks
app.get('/api/network', (req, res) => {
  res.json(getNetworkInterfaces());
});

app.get('/api/check-port', (req, res) => {
  res.json({ success: true, port: req.query.port });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('room:create', ({ roomId }) => {
    socket.join(roomId);
    console.log(`Host created room: ${roomId}`);
    socket.emit('room:created', { roomId });
  });

  socket.on('room:join', ({ roomId }) => {
    socket.join(roomId);
    console.log(`Viewer joined room: ${roomId}`);
    socket.to(roomId).emit('peer:joined', { peerId: socket.id });
  });

  socket.on('signal:offer', ({ offer, to, roomId }) => {
    socket.to(to || roomId).emit('signal:offer', { offer, from: socket.id });
  });

  socket.on('signal:answer', ({ answer, to }) => {
    socket.to(to).emit('signal:answer', { answer, from: socket.id });
  });

  socket.on('signal:ice', ({ candidate, to }) => {
    socket.to(to).emit('signal:ice', { candidate, from: socket.id });
  });

  socket.on('stream:ended', ({ roomId }) => {
    socket.to(roomId).emit('stream:ended');
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(SIGNAL_PORT, '0.0.0.0', () => {
  console.log(`Signaling server running on port ${SIGNAL_PORT}`);
  try {
    bonjour.publish({ name: 'ScreenSync', type: 'http', port: SIGNAL_PORT });
    console.log('mDNS Broadcast published via Bonjour');
  } catch (error) {
    console.error('Bonjour publish failed:', error.message);
  }
});
