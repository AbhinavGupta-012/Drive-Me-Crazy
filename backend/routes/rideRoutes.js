const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const Ride = require("../models/Ride");
const User = require("../models/User");

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ firebaseUid: req.user.uid });
      if (!user) {
        console.log("❌ User not found in DB");
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`🔹 User Role: ${user.role}`);
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: `Access denied. Must be a ${allowedRoles.join(" or ")}.`,
        });
      }

      req.userModel = user;
      next();
    } catch (error) {
      console.error("❌ Error checking user role:", error);
      res.status(500).json({ message: "Error checking user role", error: error.message });
    }
  };
};

const validateLocation = (location) => {
  if (!location || typeof location !== "object") {
    return false;
  }
  if (!location.address || !location.coordinates || !Array.isArray(location.coordinates.coordinates)) {
    return false;
  }

  const [longitude, latitude] = location.coordinates.coordinates;
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
};

const emitRideUpdate = async (io, ride, event) => {
  if (!io) {
    console.error("⚠️ WebSocket IO instance is missing!");
    return;
  }

  const populatedRide = await Ride.findById(ride._id)
    .populate("riderId", "fullName profilePicture")
    .populate("driverId", "fullName profilePicture");

  io.to(populatedRide.riderId.firebaseUid).emit(event, populatedRide.toJSON());

  if (populatedRide.driverId) {
    io.to(populatedRide.driverId.firebaseUid).emit(event, populatedRide.toJSON());
  }

  if (event === "rideRequested") {
    io.to("driver").emit("newRideAvailable", populatedRide.toJSON());
  }
};

router.post("/request", verifyToken, checkRole(["rider"]), async (req, res) => {
  try {
    console.log("📩 Incoming Ride Request");
    console.log("🔹 Request Body:", JSON.stringify(req.body, null, 2));

    const { pickupLocation, dropoffLocation, estimatedDuration, estimatedDistance, estimatedPrice } = req.body;

    if (!validateLocation(pickupLocation) || !validateLocation(dropoffLocation)) {
      console.log("❌ Invalid Location Data");
      return res.status(400).json({ message: "Invalid location data. Ensure correct latitude & longitude." });
    }

    if (!estimatedDuration || !estimatedDistance || !estimatedPrice) {
      console.log("❌ Missing Ride Estimates");
      return res.status(400).json({ message: "Missing ride estimates (duration, distance, price)" });
    }

    const ride = new Ride({
      riderId: req.userModel._id,
      pickupLocation,
      dropoffLocation,
      estimatedDuration,
      estimatedDistance,
      estimatedPrice,
      status: "requested",
    });

    await ride.save();
    console.log("✅ Ride Created:", ride._id);

    const io = req.app.get("io");
    await emitRideUpdate(io, ride, "rideRequested");

    res.status(201).json({ message: "Ride requested successfully", ride: ride.toJSON() });
  } catch (error) {
    console.error("❌ Error Requesting Ride:", error);
    res.status(500).json({ message: "Error requesting ride", error: error.message });
  }
});

router.post('/accept/:rideId', verifyToken, checkRole(['driver']), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    console.log(`🚕 Ride Current Status: ${ride.status}`);

    // 🔍 Prevent duplicate "accepted" status
    if (ride.status === 'accepted') {
      console.log("⚠️ Ride is already accepted. No update needed.");
      return res.status(400).json({ message: "Ride is already accepted." });
    }

    // 🔍 Prevent invalid status transitions
    if (ride.status !== 'requested') {
      console.log(`❌ Invalid transition: Cannot change from ${ride.status} to accepted.`);
      return res.status(400).json({ message: `Invalid status transition from ${ride.status} to accepted.` });
    }

    ride.status = 'accepted';
    ride.driverId = req.userModel._id;
    ride.acceptedAt = new Date();
    
    console.log("✅ Ride status updated to accepted.");

    await ride.save();

    const io = req.app.get('io');
    await emitRideUpdate(io, ride, 'rideAccepted');

    res.json({
      message: 'Ride accepted successfully',
      ride: ride.toJSON()
    });
  } catch (error) {
    console.error('❌ Error Accepting Ride:', error);
    res.status(500).json({
      message: 'Error accepting ride',
      error: error.message
    });
  }
});


// Other routes (start, complete, cancel, fetch ride)
router.post("/start/:rideId", verifyToken, checkRole(["driver"]), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (!ride.canPerformAction(req.userModel._id, "driver", "start")) {
      return res.status(400).json({ message: "Cannot start this ride" });
    }

    ride.status = "ongoing";
    await ride.save();

    const io = req.app.get("io");
    await emitRideUpdate(io, ride, "rideStarted");

    res.json({ message: "Ride started successfully", ride: ride.toJSON() });
  } catch (error) {
    console.error("❌ Error Starting Ride:", error);
    res.status(500).json({ message: "Error starting ride", error: error.message });
  }
});

router.post("/complete/:rideId", verifyToken, checkRole(["driver"]), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    ride.status = "completed";
    ride.actualPrice = req.body.actualPrice || ride.estimatedPrice;
    await ride.save();

    const io = req.app.get("io");
    await emitRideUpdate(io, ride, "rideCompleted");

    res.json({ message: "Ride completed successfully", ride: ride.toJSON() });
  } catch (error) {
    console.error("❌ Error Completing Ride:", error);
    res.status(500).json({ message: "Error completing ride", error: error.message });
  }
});

module.exports = router;
