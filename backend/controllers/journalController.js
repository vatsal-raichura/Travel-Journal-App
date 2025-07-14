const JournalEntry = require("../models/JournalEntry");
const path = require("path");
const cloudinary = require('../utils/cloudinary'); // your configured cloudinary uploader



// Create journal entry
exports.createEntry = async (req, res) => {
  try {
    const {
      title,
      content,
      tripId,
    
      mood,
      tags,
      isPrivate,
      location
    } = req.body;

     // Upload all images to Cloudinary
    const uploadedImageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'TravelJournalImages'
        });
        uploadedImageUrls.push(result.secure_url);
      }
    }

    // Parse tags and images if they come as JSON strings
    const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags || '[]');
    // const parsedImages = Array.isArray(images) ? images : JSON.parse(images || '[]');

    const newEntry = new JournalEntry({
      userId: req.user.userId,
      tripId,
      title,
      content,
      mood,
      tags: parsedTags,
      // images: parsedImages, 
      images: uploadedImageUrls,
      isPrivate: isPrivate || false,
      location,
      // 👈 handles multiple files
    });

    console.log("Uploaded files:", req.files);

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({
      msg: "Failed to create journal entry",
      error: err.message
    });
  }
};

exports.getAllEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch all entries", error: err.message });
  }
};

// Get all journals by the logged-in user
exports.getEntriesByUser = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch entries", error: err.message });
  }
};


// Get a single journal entry by ID
exports.getEntryById = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!entry) return res.status(404).json({ msg: "Entry not found" });

    res.json(entry);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch journal entry", error: err.message });
  }
};

// Update a journal entry
exports.updateEntry = async (req, res) => {
  try {
    const updated = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Entry not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Failed to update entry", error: err.message });
  }
};


// Get entries by trip
exports.getEntriesByTrip = async (req, res) => {
  try {
    const entries = await JournalEntry.find({
      userId: req.user.userId,
      tripId: req.params.tripId,
    }).sort({ date: -1 });

    res.json(entries);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Failed to fetch entries", error: err.message });
  }
};

// Delete entry
exports.deleteEntry = async (req, res) => {
  try {
    const deleted = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deleted) return res.status(404).json({ msg: "Entry not found" });
    res.json({ msg: "Journal entry deleted" });
  } catch (err) {
    console.error("Upload error:", err); // log the actual error
    res.status(500).json({
      msg: "Failed to create journal entry",
      error: err.message || err.toString(),
    });
  }
};
