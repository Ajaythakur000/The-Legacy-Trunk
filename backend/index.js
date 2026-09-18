import 'dotenv/config';
import './workers/pdfWorker.js';
import './workers/otpWorker.js'; // Start BullMQ Worker

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';

// Routes Imports
import userRoutes from './routes/userRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import circleRoutes from './routes/circleRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import { initializeSocket } from './socket/socketHandler.js';

const app = express();

// 🟢 FIX 1: Strict Allowed Origins (Sirf inhi links se request aayegi)
const allowedOrigins = [
  'http://localhost:5173',               //  local frontend
  'http://localhost:5174',               // Backup local port
  'https://the-legacy-trunk.vercel.app'  // Live Vercel Frontend
];

// 🟢 FIX 2: Secure Express CORS with Credentials
const corsOptions = {
  origin: function (origin, callback) {
    // Agar origin nahi hai (jaise Postman ya server-to-server), ya phir allowed list mein hai
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true, // IMPORTANT: Iske bina Login/Cookies kaam nahi karenge
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

// REST APIs
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to The Legacy Trunk API! Vault is Secured. 🔒');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Server Error Caught:', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS Policy Violation' });
  }
  res.status(500).json({ message: 'Internal Server Error' });
});

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const server = http.createServer(app);

//  FIX 3: Secure Socket.IO CORS with Credentials
export const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: allowedOrigins, // Sirf allowed links hi connect honge
    methods: ['GET', 'POST'],
    credentials: true       // Socket ke liye bhi cookies allow karna zaroori hai
  },
});

app.set('io', io);

// initialize all socket events
initializeSocket(io);

// start
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});