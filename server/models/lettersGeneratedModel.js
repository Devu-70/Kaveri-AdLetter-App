const mongoose = require('mongoose');

const lettersGeneratedSchema = new mongoose.Schema({
  kaveriId: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  agentName: {
    type: String,
    required: true,
  },
  consultancy: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LettersGenerated', lettersGeneratedSchema);
