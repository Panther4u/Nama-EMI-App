console.log('--- DEBUG: Server Starting ---');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const deviceRoutes = require('./routes/deviceRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-lock-app';

const compression = require('compression'); // Optimization: Gzip

// Priority 1: Explicit APK Download Routes (Must be before static/SPA)
app.get('/downloads/app.apk', (req, res) => {
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




// Priority 2: Health Check
app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

// Middleware
app.use(compression()); // Enable Gzip
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve server/public (APK)
app.use(express.static(path.join(__dirname, '..', 'dist'))); // Serve root/dist (Vite App)

// Routes
app.use('/api/devices', deviceRoutes);

// Handle SPA routing - send all non-API requests to index.html
app.get(/(.*)/, (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(require('path').resolve(__dirname, '..', 'dist', 'index.html'));
});

// Database Connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        // Start Scheduler
        const { checkOverduePayments } = require('./scheduler');
        checkOverduePayments(); // Run on startup
        setInterval(checkOverduePayments, 3600000); // Run every 1 hour
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
