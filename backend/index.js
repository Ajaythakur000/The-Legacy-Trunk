<<<<<<< HEAD
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // .env file ki variables ko load karne ke liye
=======
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
<<<<<<< HEAD
>>>>>>> 30177b5 (5.feat: integrate global search API, timeline chronology, and social engagement logic)
=======
import http from 'http';
import { Server } from 'socket.io';
>>>>>>> 55125cf (8: add Socket.io live nostalgia rooms with room isolation, realtime chat, and live location broadcasting)

import userRoutes from './routes/userRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import circleRoutes from './routes/circleRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import { initializeSocket } from './socket/socketHandler.js';

dotenv.config();

const app = express();
<<<<<<< HEAD
app.use(express.json()); // JSON body parsing ke liye middleware
=======
app.use(cors());
app.use(express.json());
>>>>>>> 30177b5 (5.feat: integrate global search API, timeline chronology, and social engagement logic)

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