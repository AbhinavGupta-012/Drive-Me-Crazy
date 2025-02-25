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
  console.log("📩 Incoming Login Request");
  console.log("🔹 Headers:", req.headers);
  console.log("🔹 Body:", req.body);

  try {
      // Extract ID token from either body or headers
      let idToken = req.body.idToken;
      if (!idToken) {
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith("Bearer ")) {
              idToken = authHeader.split(" ")[1];
          }
      }

      if (!idToken) {
          console.log("❌ No ID token found in request!");
          return res.status(400).json({ message: 'ID token is required' });
      }

      console.log("✅ ID Token Received:", idToken);

      // Verify Firebase Token
      let decodedToken;
      try {
          decodedToken = await admin.auth().verifyIdToken(idToken);
          console.log("✅ Decoded Token:", decodedToken);
      } catch (error) {
          console.error("❌ Firebase Token Verification Failed:", error.message);
          return res.status(401).json({ message: 'Invalid ID token', error: error.message });
      }

      console.log("Extracted UID:", decodedToken.uid);

      // Find User in MongoDB
      const user = await User.findOneAndUpdate(
          { firebaseUid: decodedToken.uid },
          { lastLogin: new Date() },
          { new: true }
      );

      if (!user) {
          console.log("❌ No user found in MongoDB for UID:", decodedToken.uid);
          return res.status(404).json({ message: 'User not found' });
      }

      console.log("✅ User found in MongoDB:", user);

      res.json({
          message: 'Login successful',
          user: user.toJSON()
      });

  } catch (error) {
      console.error('❌ Login Error:', error);
      res.status(500).json({
          message: 'Authentication failed',
          error: error.message
      });
  }
});


router.put('/profile', verifyToken, async (req, res) => {
  try {
      console.log("📩 Incoming Profile Update Request");
      console.log("🔹 Extracted UID from Token:", req.user.uid);
      console.log("🔹 Request Body:", req.body);

      const { fullName, profilePicture } = req.body;

      // if (phoneNumber && !/^\+?[\d\s-()]{10,}$/.test(phoneNumber)) {
      //     console.log("❌ Invalid Phone Number Format:", phoneNumber);
      //     return res.status(400).json({ message: 'Invalid phone number format' });
      // }

      const updates = {
          ...(fullName && { fullName }),
          // ...(phoneNumber && { phoneNumber }),
          ...(profilePicture && { profilePicture })
      };

      console.log("🛠️ Applying Updates:", updates);

      const user = await User.findOneAndUpdate(
          { firebaseUid: req.user.uid },
          updates,
          { new: true, runValidators: true }
      );

      if (!user) {
          console.log("❌ No user found in MongoDB for UID:", req.user.uid);
          return res.status(404).json({ message: 'User not found' });
      }

      console.log("✅ User found in MongoDB:", user);

      if (fullName) {
          console.log("🔄 Updating Firebase Display Name:", fullName);
          await admin.auth().updateUser(req.user.uid, {
              displayName: fullName
          });
      }

      console.log("✅ Profile updated successfully!");
      res.json({
          message: 'Profile updated successfully',
          user: user.toJSON()
      });

  } catch (error) {
      console.error("❌ Profile Update Error:", error);
      res.status(500).json({
          message: 'Error updating profile',
          error: error.message
      });
  }
});

router.post('/request', verifyToken, async (req, res) => {
  try {
      console.log("📩 Incoming Ride Request");
      console.log("🔹 Full Request Body:", req.body);

      const { pickupLocation, dropoffLocation, rideType } = req.body;

      if (!pickupLocation || !dropoffLocation) {
          console.log("❌ Missing pickup or dropoff location");
          return res.status(400).json({ message: 'Pickup and dropoff locations are required' });
      }

      if (
          typeof pickupLocation.latitude !== 'number' || typeof pickupLocation.longitude !== 'number' ||
          typeof dropoffLocation.latitude !== 'number' || typeof dropoffLocation.longitude !== 'number'
      ) {
          console.log("❌ Invalid location data detected!", { pickupLocation, dropoffLocation });
          return res.status(400).json({ message: 'Invalid location data provided' });
      }

      console.log("✅ Valid locations received:", { pickupLocation, dropoffLocation });

      const ride = new Ride({
          riderId: req.user.uid,
          pickupLocation,
          dropoffLocation,
          rideType,
          status: "requested",
          createdAt: new Date(),
      });

      await ride.save();

      console.log("🚖 Ride request created successfully:", ride);

      res.status(201).json({
          message: "Ride request created successfully",
          ride
      });

  } catch (error) {
      console.error("❌ Ride Request Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
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