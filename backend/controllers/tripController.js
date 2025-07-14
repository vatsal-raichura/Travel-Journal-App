const Trip = require('../models/Trip');

// Create new trip
exports.createTrip = async (req, res) => {
  try {
    const {
      title,
      destination,
      startDate,
      endDate,
      description,
          
      tags = [],            // default empty array
      isPublic = false      // optional: support this if you want public trips
    } = req.body;

    const coverImage = req.file ? req.file.path : ''; // ✅ FIX


    // ✅ Basic validation (optional)
    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const newTrip = new Trip({
      userId: req.user.userId, // Injected from auth middleware
      title,
      destination,
      startDate,
      endDate,
      description,
      coverImage,
      tags: Array.isArray(tags) ? tags : JSON.parse(tags),
      isPublic
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);

  } catch (err) {
    res.status(500).json({ msg: 'Failed to create trip', error: err.message });
  }
};

// 🔹 Get all trips of the logged-in user
exports.getTripsByUser = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.userId }).sort({ startDate: 1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch user trips', error: err.message });
  }
};

// 🔹 Get all trips (admin or for testing)
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find().sort({ startDate: 1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch all trips', error: err.message });
  }
};

// Get a single trip by ID
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!trip) return res.status(404).json({ msg: 'Trip not found' });

    res.json(trip);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch trip', error: err.message });
  }
};


// Update a trip
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!trip) return res.status(404).json({ msg: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update trip', error: err.message });
  }
};

// Delete a trip
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!trip) return res.status(404).json({ msg: 'Trip not found' });
    res.json({ msg: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete trip', error: err.message });
  }
};
