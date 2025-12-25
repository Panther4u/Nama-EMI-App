const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-lock-app';

async function checkDb() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        const Device = mongoose.model('Device', new mongoose.Schema({ id: String, customerName: String }));
        const device = await Device.findOne();
        console.log('Sample Device:', JSON.stringify(device, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDb();
