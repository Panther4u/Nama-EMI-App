const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const deviceRoutes = require('./routes/deviceRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-lock-app';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve files from 'public' folder
app.use(express.static('dist')); // Serve Vite build output

// Handle SPA routing - send all non-API requests to index.html
app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(require('path').resolve(__dirname, '..', 'dist', 'index.html'));
});

// Routes
app.use('/api/devices', deviceRoutes);

// Database Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
