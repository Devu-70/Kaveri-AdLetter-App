 const mongoose = require('mongoose');

const creditLogSchema = new mongoose.Schema({
  kaveriId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'creditlogs' });

module.exports = mongoose.model('CreditLog', creditLogSchema);
