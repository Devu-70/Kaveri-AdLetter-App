const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  consultancyName: { type: String, required: true },
  consultancyLocation: { type: String, required: true },
  verificationStatus: { type: Boolean, default: false },
  kaveriId: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'agent' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
