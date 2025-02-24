const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/auth');
const Ride = require('../models/Ride');
const User = require('../models/User');

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ firebaseUid: req.user.uid });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: `Access denied. Must be a ${allowedRoles.join(' or ')}.` 
        });
      }

      req.userModel = user;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking user role', error: error.message });
    }
  };
};

const validateLocation = (location) => {
  if (!location?.address || !location?.coordinates?.coordinates) {
    return false;
  }

  const [longitude, latitude] = location.coordinates.coordinates;
  return Array.isArray(location.coordinates.coordinates) &&
         location.coordinates.coordinates.length === 2 &&
         longitude >= -180 && longitude <= 180 &&
         latitude >= -90 && latitude <= 90;
};

const emitRideUpdate = async (io, ride, event) => {
  const populatedRide = await Ride.findById(ride._id)
    .populate('riderId', 'fullName profilePicture')
    .populate('driverId', 'fullName profilePicture');

  io.to(populatedRide.riderId.firebaseUid).emit(event, populatedRide.toJSON());
  if (populatedRide.driverId) {
    io.to(populatedRide.driverId.firebaseUid).emit(event, populatedRide.toJSON());
  }

  if (event === 'rideRequested') {
    io.to('driver').emit('newRideAvailable', populatedRide.toJSON());
  }
};

router.post('/request', verifyToken, checkRole(['rider']), async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      estimatedDuration,
      estimatedDistance,
      estimatedPrice
    } = req.body;

    if (!validateLocation(pickupLocation) || !validateLocation(dropoffLocation)) {
      return res.status(400).json({ message: 'Invalid location data provided' });
    }

    if (!estimatedDuration || !estimatedDistance || !estimatedPrice) {
      return res.status(400).json({ message: 'Missing ride estimates' });
    }

    const ride = new Ride({
      riderId: req.userModel._id,
      pickupLocation,
      dropoffLocation,
      estimatedDuration,
      estimatedDistance,
      estimatedPrice
    });

    await ride.save();

    const io = req.app.get('io');
    await emitRideUpdate(io, ride, 'rideRequested');

    res.status(201).json({
      message: 'Ride requested successfully',
      ride: ride.toJSON()
    });
  } catch (error) {
    console.error('Error requesting ride:', error);
    res.status(500).json({
      message: 'Error requesting ride',
      error: error.message
    });
  }
});

router.post('/accept/:rideId', verifyToken, checkRole(['driver']), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (!ride.canPerformAction(req.userModel._id, 'driver', 'accept')) {
      return res.status(400).json({ message: 'Cannot accept this ride' });
    }

    ride.status = 'accepted';
    ride.driverId = req.userModel._id;
    await ride.save();

    const io = req.app.get('io');
    await emitRideUpdate(io, ride, 'rideAccepted');

    res.json({
      message: 'Ride accepted successfully',
      ride: ride.toJSON()
    });
  } catch (error) {
    console.error('Error accepting ride:', error);
    res.status(500).json({
      message: 'Error accepting ride',
      error: error.message
    });
  }
});

router.post('/start/:rideId', verifyToken, checkRole(['driver']), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (!ride.canPerformAction(req.userModel._id, 'driver', 'start')) {
      return res.status(400).json({ message: 'Cannot start this ride' });
    }

    ride.status = 'ongoing';
    await ride.save();

    const io = req.app.get('io');
    await emitRideUpdate(io, ride, 'rideStarted');

    res.json({
      message: 'Ride started successfully',
      ride: ride.toJSON()
    });
  } catch (error) {
    console.error('Error starting ride:', error);
    res.status(500).json({
      message: 'Error starting ride',
      error: error.message
    });
  }
});

router.post('/complete/:rideId', verifyToken, checkRole(['driver']), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (!ride.canPerformAction(req.userModel._id, 'driver', 'complete')) {
      return res.status(400).json({ message: 'Cannot complete this ride' });
    }

    ride.status = 'completed';
    ride.actualPrice = req.body.actualPrice || ride.estimatedPrice;
    await ride.save();

    const io = req.app.get('io');
    await emitRideUpdate(io, ride, 'rideCompleted');

    res.json({
      message: 'Ride completed successfully',
      ride: ride.toJSON()
    });
  } catch (error) {
    console.error('Error completing ride:', error);
    res.status(500).json({
      message: 'Error completing ride',
      error: error.message
    });
  }
});

router.post('/cancel/:rideId', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (!ride.canPerformAction(user._id, user.role, 'cancel')) {
      return res.status(400).json({ message: 'Cannot cancel this ride' });
    }

    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    await ride.save();

    const io = req.app.get('io');
    await emitRideUpdate(io, ride, 'rideCancelled');

    res.json({
      message: 'Ride cancelled successfully',
      ride: ride.toJSON()
    });
  } catch (error) {
    console.error('Error cancelling ride:', error);
    res.status(500).json({
      message: 'Error cancelling ride',
      error: error.message
    });
  }
});

router.get('/:rideId', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    const ride = await Ride.findById(req.params.rideId)
      .populate('riderId', 'fullName profilePicture')
      .populate('driverId', 'fullName profilePicture');
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (!ride.riderId.equals(user._id) && 
        !(ride.driverId && ride.driverId.equals(user._id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ ride: ride.toJSON() });
  } catch (error) {
    console.error('Error fetching ride:', error);
    res.status(500).json({
      message: 'Error fetching ride',
      error: error.message
    });
  }
});


router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = {
      $or: [
        { riderId: user._id },
        { driverId: user._id }
      ]
    };

    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate('riderId', 'fullName profilePicture')
      .populate('driverId', 'fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Ride.countDocuments(query);

    res.json({
      rides: rides.map(ride => ride.toJSON()),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRides: total,
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({
      message: 'Error fetching rides',
      error: error.message
    });
  }
});

module.exports = router;