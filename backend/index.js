import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import userRoutes from './routes/userRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import circleRoutes from './routes/circleRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import { initializeSocket } from './socket/socketHandler.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

// REST APIs
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/timelines', timelineRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/messages', messageRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to The Legacy Trunk API!');
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

// HTTP server + Socket.io setup
const server = http.createServer(app);


export const io = new Server(server, {
  cors: {
    origin: '*', // production me frontend domain specify karna
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

// initialize all socket events
initializeSocket(io);

// start
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});