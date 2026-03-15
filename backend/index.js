<<<<<<< HEAD
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // .env file ki variables ko load karne ke liye
=======
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
>>>>>>> 30177b5 (5.feat: integrate global search API, timeline chronology, and social engagement logic)

import userRoutes from './routes/userRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import circleRoutes from './routes/circleRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

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

app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/timelines', timelineRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/location', locationRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

app.get('/', (req, res) => {
  res.send('Welcome to The Legacy Trunk API!');
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});