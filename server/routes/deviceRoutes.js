const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// Get all devices
router.get('/', async (req, res) => {
    try {
        const devices = await Device.find().lean();
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get device by custom ID
router.get('/:id', async (req, res) => {
    console.log('Lookup request for ID:', req.params.id);
    try {
        const device = await Device.findOne({ id: req.params.id }).lean();
        if (!device) {
            console.warn('Device not found for ID:', req.params.id);
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json(device);
    } catch (err) {
        console.error('Error in device lookup:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// Create new device
router.post('/', async (req, res) => {
    console.log('Incoming Device Data:', JSON.stringify(req.body, null, 2));
    const device = new Device(req.body);
    try {
        const newDevice = await device.save();
        console.log('Device saved successfully:', newDevice.id);
        res.status(201).json(newDevice);
    } catch (err) {
        console.error('Error saving device:', err.message);
        res.status(400).json({ message: err.message });
    }
});

// Update device
router.put('/:id', async (req, res) => {
    try {
        const device = await Device.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.json(device);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update location specifically (optimized)
router.put('/:id/location', async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const device = await Device.findOneAndUpdate(
            { id: req.params.id },
            {
                $set: {
                    'location.lat': lat,
                    'location.lng': lng,
                    'location.lastUpdated': new Date()
                }
            },
            { new: true }
        );
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.json(device.location);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add payment
router.post('/:id/payment', async (req, res) => {
    try {
        const { payment, nextDueDate } = req.body;
        const device = await Device.findOne({ id: req.params.id });

        if (!device) return res.status(404).json({ message: 'Device not found' });

        device.emiDetails.paidEmis += 1;
        device.emiDetails.nextDueDate = nextDueDate;
        device.emiDetails.paymentHistory.push(payment);

        const updatedDevice = await device.save();
        res.json(updatedDevice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Lock/Unlock shortcuts
router.post('/:id/lock', async (req, res) => {
    try {
        const device = await Device.findOneAndUpdate(
            { id: req.params.id },
            {
                $set: {
                    isLocked: true,
                    featureLocks: { camera: true, network: true, wifi: true, powerOff: true, reset: true }
                }
            },
            { new: true }
        );
        res.json(device);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/:id/unlock', async (req, res) => {
    try {
        const device = await Device.findOneAndUpdate(
            { id: req.params.id },
            {
                $set: {
                    isLocked: false,
                    featureLocks: { camera: false, network: false, wifi: false, powerOff: false, reset: false }
                }
            },
            { new: true }
        );
        res.json(device);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete device
router.delete('/:id', async (req, res) => {
    try {
        const device = await Device.findOneAndDelete({ id: req.params.id });
        if (!device) return res.status(404).json({ message: 'Device not found' });
        console.log('Device deleted:', req.params.id);
        res.json({ message: 'Device deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete all devices (Maintenance)
router.delete('/', async (req, res) => {
    try {
        await Device.deleteMany({});
        console.log('All devices cleared via API');
        res.json({ message: 'All devices deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
