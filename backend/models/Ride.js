const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    }
  }
});

const rideSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  pickupLocation: {
    type: locationSchema,
    required: true
  },
  dropoffLocation: {
    type: locationSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'ongoing', 'completed', 'cancelled'],
    default: 'requested',
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  estimatedDuration: {
    type: Number,
    required: true
  },
  estimatedDistance: {
    type: Number,
    required: true
  },
  estimatedPrice: {
    type: Number,
    required: true
  },
  actualPrice: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// ✅ Indexing for faster lookups
rideSchema.index({ status: 1, requestedAt: -1 });
rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
rideSchema.index({ 'dropoffLocation.coordinates': '2dsphere' });

// ✅ Validate status transitions
rideSchema.pre('save', function (next) {
  if (!this.isModified('status')) return next();

  const validTransitions = {
    requested: ['accepted', 'cancelled'],
    accepted: ['ongoing', 'cancelled'],
    ongoing: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (this.isNew && this.status !== 'requested') {
    return next(new Error('New rides must start with status "requested"'));
  }

  if (!this.isNew) {
    const prevStatus = this._previousStatus || 'requested';
    if (!validTransitions[prevStatus].includes(this.status)) {
      console.log(`🚨 Invalid status transition: ${prevStatus} → ${this.status}`);
      return next(new Error(`Invalid status transition from ${prevStatus} to ${this.status}`));
    }
  }

  const timestampField = `${this.status}At`;
  if (!this[timestampField]) {
    this[timestampField] = new Date();
  }

  next();
});

// ✅ Methods for user actions
rideSchema.methods.canPerformAction = function (userId, userRole, action) {
  const actions = {
    accept: () => userRole === 'driver' && this.status === 'requested',
    start: () => userRole === 'driver' && this.driverId?.equals(userId) && this.status === 'accepted',
    complete: () => userRole === 'driver' && this.driverId?.equals(userId) && this.status === 'ongoing',
    cancel: () => (this.riderId.equals(userId) || this.driverId?.equals(userId)) && ['requested', 'accepted', 'ongoing'].includes(this.status)
  };
  return actions[action] ? actions[action]() : false;
};

// ✅ Get ride details with user info
rideSchema.methods.getRideDetails = async function () {
  return await this.populate('riderId driverId').execPopulate();
};

// ✅ Cleanup response
rideSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
