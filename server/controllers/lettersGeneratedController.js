const LettersGenerated = require('../models/lettersGeneratedModel');

// Create new letter
const createLetter = async (req, res) => {
  try {
    const {
      kaveriId,
      studentName,
      fatherName,
      gender,
      course,
      agentName,
      consultancy
    } = req.body;

    if (!kaveriId || !studentName || !fatherName || !gender || !course || !agentName || !consultancy) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newLetter = new LettersGenerated({
      kaveriId,
      studentName,
      fatherName,
      gender,
      course,
      agentName,
      consultancy
    });

    await newLetter.save();

    res.status(201).json({ message: 'Letter generated successfully', letter: newLetter });
  } catch (error) {
    console.error('Error generating letter:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all letters
const getAllLetters = async (req, res) => {
  try {
    const letters = await LettersGenerated.find().sort({ createdAt: -1 });
    res.status(200).json(letters);
  } catch (error) {
    console.error('Error fetching letters:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get letters by Kaveri ID
const getLettersByKaveriId = async (req, res) => {
  try {
    const { kaveriId } = req.params;
    console.log('Fetching letters for:', kaveriId);  // <-- Add this

    const letters = await LettersGenerated.find({ kaveriId });

    if (letters.length === 0) {
      return res.status(404).json({ message: 'No letters found for this Kaveri ID' });
    }

    res.status(200).json(letters);
  } catch (error) {
    console.error('Error fetching letters by Kaveri ID:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update 'authorized' field of a letter by ID
const updateAuthorizationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { authorized } = req.body;

    // Validate 'authorized' value
    if (typeof authorized !== 'boolean') {
      return res.status(400).json({ message: "'authorized' must be a boolean value" });
    }

    const updatedLetter = await LettersGenerated.findByIdAndUpdate(
      id,
      { authorized },
      { new: true }
    );

    if (!updatedLetter) {
      return res.status(404).json({ message: 'Letter not found with this ID' });
    }

    res.status(200).json({
      message: `'authorized' status updated successfully`,
      letter: updatedLetter
    });
  } catch (error) {
    console.error('Error updating authorization status:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = {
  createLetter,
  getAllLetters,
  getLettersByKaveriId,
  updateAuthorizationStatus
};
