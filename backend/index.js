const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // .env file ki variables ko load karne ke liye

const userRoutes = require('./routes/userRoutes');
const storyRoutes = require('./routes/storyRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const circleRoutes = require('./routes/circleRoutes'); 
const searchRoutes = require('./routes/searchRoutes'); 
const exportRoutes = require('./routes/exportRoutes');

// Express app initialize karna
const app = express();
app.use(express.json()); // JSON body parsing ke liye middleware

// Environment variables se PORT aur MONGO_URI lena
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/timelines', timelineRoutes);
app.use('/api/circles', circleRoutes); // Family Circle ke routes
app.use('/api/search', searchRoutes); 
app.use('/api/export', exportRoutes); // Export routes
// Database se connect karne ka function

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        // Agar connection fail hota hai to process ko exit kar dega
        process.exit(1);
    }
};

// Database connection ko call karna
connectDB();

// Ek test route taaki hum check kar sakein server chal raha hai
app.get('/', (req, res) => {
    res.send('Welcome to The Legacy Trunk API!');
});

// Server ko start karna
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});