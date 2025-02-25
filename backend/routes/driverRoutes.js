const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('../config/firebase-config');

// ✅ Driver Registration Route
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, vehicle, license, aadhar } = req.body;

        if (!fullName || !email || !password || !vehicle || !license || !aadhar) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // ✅ Create Firebase User
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: fullName
        });

        // ✅ Save Driver in MongoDB
        const newDriver = new User({
            firebaseUid: userRecord.uid,
            fullName,
            email,
            role: 'driver',
            vehicle,
            license,
            aadhar
        });

        await newDriver.save();

        res.status(201).json({ message: 'Driver registered successfully', driver: newDriver });
    } catch (error) {
        console.error('❌ Driver Registration Error:', error.message);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

module.exports = router;
