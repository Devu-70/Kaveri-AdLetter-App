const mongoose = require('mongoose');

const userCreditsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kaveriId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  totalCredits: {
    type: Number,
    default: 0
  },
  usedCredits: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('UserCredits', userCreditsSchema);
