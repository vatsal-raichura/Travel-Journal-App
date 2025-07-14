const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  images: [String],
  mood: {
    type: String,
    enum: ['happy', 'sad', 'excited', 'calm', 'reflective', 'tired'],
    default: 'calm'
  },
  tags: [String],
  isPrivate: {
    type: Boolean,
    default: false
  },
  location: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
