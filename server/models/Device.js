const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
    id: String,
    emiNumber: Number,
    amount: Number,
    paidDate: Date,
    transactionId: String,
    paymentMethod: String,
    recordedBy: String,
    recordedAt: Date
});

const deviceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Custom ID to match frontend
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    mobileNo: { type: String, required: true },
    aadharNo: { type: String, required: true },
    address: { type: String, required: true },
    imei1: { type: String, required: true, unique: true },
    imei2: { type: String, required: true },
    deviceModel: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
    location: {
        lat: Number,
        lng: Number,
        lastUpdated: Date
    },
    featureLocks: {
        camera: { type: Boolean, default: false },
        network: { type: Boolean, default: false },
        wifi: { type: Boolean, default: false },
        powerOff: { type: Boolean, default: false },
        reset: { type: Boolean, default: false }
    },
    emiDetails: {
        financeName: String,
        financePhone: String,
        totalAmount: Number,
        emiAmount: Number,
        tenure: Number,
        paidEmis: { type: Number, default: 0 },
        nextDueDate: Date,
        paymentHistory: [paymentHistorySchema]
    },
    registeredAt: { type: Date, default: Date.now },
    qrCodeData: String,
    telemetry: {
        batteryLevel: Number,
        networkType: String,
        simCarrier: String,
        androidVersion: String,
        lastSeen: { type: Date, default: Date.now }
    },
    isTracking: { type: Boolean, default: false },
    permissionsGranted: { type: Boolean, default: false },
    wipeRequested: { type: Boolean, default: false },
    releaseRequested: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);
