import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import scrapingService from './services/scrapingService.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import scrapingRoutes from './routes/scraping.js';
import analyticsRoutes from './routes/analytics.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Inject io into scraping service
scrapingService.setIO(io);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.log('[Socket] Connection without token, allowing anyway');
  }
  next();
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join:job', (jobId) => {
    if (jobId) {
      socket.join(`job:${jobId}`);
      console.log(`[Socket] ${socket.id} joined job:${jobId}`);
    }
  });

  socket.on('leave:job', (jobId) => {
    if (jobId) {
      socket.leave(`job:${jobId}`);
      console.log(`[Socket] ${socket.id} left job:${jobId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    clients: io.engine.clientsCount,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scraping', scrapingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();

  try {
    await connectRedis();
  } catch {}

  server.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════╗
  ║   CrawlForge Server Running      ║
  ║   Port: ${PORT}                       ║
  ║   Env:  ${process.env.NODE_ENV || 'development'}                   ║
  ║   Socket.IO: enabled              ║
  ╚═══════════════════════════════════╝
    `);
  });
};

start();
