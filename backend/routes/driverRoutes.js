const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver'); // Driver Model

// Register Driver (Pending Approval)
router.post('/register', async (req, res) => {
    const { fullName, email, phone, vehicle, license } = req.body;
    try {
        const driver = new Driver({ fullName, email, phone, vehicle, license, status: 'pending' });
        await driver.save();
        res.status(201).json({ message: 'Driver registered, awaiting approval' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering driver' });
    }
});

// Get Pending Drivers (Admin)
router.get('/admin/drivers', async (req, res) => {
    try {
        const pendingDrivers = await Driver.find({ status: 'pending' });
        res.json({ drivers: pendingDrivers });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching drivers' });
    }
});

// Approve Driver
router.put('/admin/approve-driver/:id', async (req, res) => {
    try {
        await Driver.findByIdAndUpdate(req.params.id, { status: 'approved' });
        res.json({ message: 'Driver approved' });
    } catch (err) {
        res.status(500).json({ message: 'Error approving driver' });
    }
});

// Reject Driver
router.delete('/admin/reject-driver/:id', async (req, res) => {
    try {
        await Driver.findByIdAndDelete(req.params.id);
        res.json({ message: 'Driver rejected' });
    } catch (err) {
        res.status(500).json({ message: 'Error rejecting driver' });
    }
});

module.exports = router;
