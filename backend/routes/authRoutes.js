const express = require('express');
const router = express.Router();
const admin = require('../config/firebase-config');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const validateSignupInput = (req, res, next) => {
    console.log("🔹 Incoming request body:", req.body);
    
    const { email, password, fullName, role } = req.body;
    
    if (!email || !password || !fullName) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }
    
    if (role && !['rider', 'driver'].includes(role)) {
      console.log("❌ Invalid role:", role);
      return res.status(400).json({ message: 'Role must be either rider or driver' });
    }
  
    // if (phoneNumber && !/^\+?[\d\s-()]{10,}$/.test(phoneNumber)) {
    //   console.log("❌ Invalid phone number format:", phoneNumber);
    //   return res.status(400).json({ message: 'Invalid phone number format' });
    // }
  
    console.log("✅ Validation passed, proceeding to signup handler");
    next();
  };
  

router.post('/signup', validateSignupInput, async (req, res) => {
  try {
    console.log("🟢 Signup request received:", req.body);
    const { email, password, fullName, role } = req.body;
    console.log("🔹 Creating Firebase user with password:", password);
    
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    //   phoneNumber,
      emailVerified: false,
    });

    console.log("✅ User created in Firebase:", userRecord.uid);
    const user = new User({
      firebaseUid: userRecord.uid,
      email,
      fullName,
    //   phoneNumber,
      role: role || 'rider',
    });

    await user.save();
    
    const token = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error("❌ Firebase Error:", error.code, error.message);
    console.error('Registration error:', error);
    
    if (error.code === 'auth/email-already-exists' || error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("Decoded Token:", decodedToken);
    console.log("Extracted UID:", decodedToken.uid);


    const user = await User.findOneAndUpdate(
      { firebaseUid: decodedToken.uid },
      { lastLogin: new Date() },
      { new: true }
    );

    if (!user) {
        console.log("No user found in MongoDB for UID:", decodedToken.uid);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("User found:", user);
    res.json({
      message: 'Login successful',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      message: 'Authentication failed',
      error: error.message
    });
  }
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, phoneNumber, profilePicture } = req.body;
    
    if (phoneNumber && !/^\+?[\d\s-()]{10,}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    const updates = {
      ...(fullName && { fullName }),
      ...(phoneNumber && { phoneNumber }),
      ...(profilePicture && { profilePicture })
    };

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) {
      await admin.auth().updateUser(req.user.uid, {
        displayName: fullName
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
});

router.post('/logout', verifyToken, async (req, res) => {
  try {
    await admin.auth().revokeRefreshTokens(req.user.uid);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Logout failed',
      error: error.message
    });
  }
});

module.exports = router;