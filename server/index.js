console.log('--- DEBUG: Server Starting ---');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const deviceRoutes = require('./routes/deviceRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-lock-app';

const compression = require('compression'); // Optimization: Gzip

// Middleware
app.use(compression()); // Enable Gzip
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve files from 'public' folder
app.use(express.static('dist')); // Serve Vite build output

// Health Check for Render (Keep-Alive)
app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

// Explicit APK Download Route (Debugs "File Missing" issue)
const path = require('path');
const fs = require('fs');

app.get('/downloads/app.apk', (req, res) => {
    // Correct path relative to server/index.js
    const apkPath = path.join(__dirname, 'public', 'downloads', 'app.apk');
    console.log('Checking APK path:', apkPath);

    if (fs.existsSync(apkPath)) {
        console.log('✅ Serving APK file');
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="app-release.apk"');
        const stat = fs.statSync(apkPath);
        res.setHeader('Content-Length', stat.size);
        res.download(apkPath, 'app-release.apk');
    } else {
        console.error('❌ APK FILE MISSING at:', apkPath);
        res.status(404).send('APK File Not Found on Server');
    }
});

// Routes
app.use('/api/devices', deviceRoutes);

// Handle SPA routing - send all non-API requests to index.html
app.get(/(.*)/, (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(require('path').resolve(__dirname, '..', 'dist', 'index.html'));
});

// Database Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
