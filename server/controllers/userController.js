
const User = require('../models/userModel');
const UserCredits = require('../models/userCreditsModel');
const bcrypt = require('bcrypt');

// Generate custom Kaveri ID
const generateKaveriId = (name) => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  const first3 = name.slice(0, 3).toUpperCase();
  const time = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
  return `${month}${year}${first3}${time}`;
};

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      consultancyName,
      consultancyLocation,
      password
    } = req.body;

    if (!name || !email || !contact || !consultancyName || !consultancyLocation || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { contact }] });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'User already exists with this email' });
      }
      if (existingUser.contact === contact) {
        return res.status(409).json({ message: 'User already exists with this contact number' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const kaveriId = generateKaveriId(name);

    const newUser = new User({
      name,
      email,
      contact,
      consultancyName,
      consultancyLocation,
      kaveriId,
      password: hashedPassword,
      role: 'agent'
    });

    await newUser.save();

    const userCredits = new UserCredits({
      userId: newUser._id,
      kaveriId: newUser.kaveriId,
      name: newUser.name,
      totalCredits: 0,
      usedCredits: 0
    });

    await userCredits.save();

    res.status(201).json({ 
      message: 'Registered successfully',
      kaveriId: newUser.kaveriId
    });

  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserByKaveriId = async (req, res) => {
  try {
    const { kaveriId } = req.params;
    const io = req.app.get('io');

    const user = await User.findOne({ kaveriId });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this Kaveri ID' });
    }

    const userCredits = await UserCredits.findOne({ kaveriId });
    const availableCredits = userCredits ? userCredits.totalCredits - userCredits.usedCredits : null;

    // Emit update only if credits exist
    if (userCredits && io) {
      io.to(kaveriId).emit('availableCreditsUpdated', { 
        availableCredits: userCredits.totalCredits - userCredits.usedCredits 
      });
    }
    console.log(user,userCredits,availableCredits)
    res.status(200).json({ 
      user,
      credits: userCredits || null,
      availableCredits 
    });

  } catch (error) {
    console.error('Error fetching user by Kaveri ID:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // Optional: sort by latest
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const updateVerificationStatus = async (req, res) => {
  try {
    const { kaveriId } = req.params;
    const { verificationStatus, isSuspended, role } = req.body;

    // Validate verificationStatus if provided
    if (verificationStatus !== undefined && typeof verificationStatus !== 'boolean') {
      return res.status(400).json({ message: 'verificationStatus must be a boolean value' });
    }

    // Validate isSuspended if provided
    if (isSuspended !== undefined && typeof isSuspended !== 'boolean') {
      return res.status(400).json({ message: 'isSuspended must be a boolean value' });
    }

    // Validate role if provided
    const allowedRoles = ['agent', 'admin', 'manager'];
    if (role !== undefined) {
      if (typeof role !== 'string' || !allowedRoles.includes(role)) {
        return res.status(400).json({ message: `role must be one of: ${allowedRoles.join(', ')}` });
      }
    }

    const updateFields = {};
    if (verificationStatus !== undefined) updateFields.verificationStatus = verificationStatus;
    if (isSuspended !== undefined) updateFields.isSuspended = isSuspended;
    if (role !== undefined) updateFields.role = role;

    const updatedUser = await User.findOneAndUpdate(
      { kaveriId },
      updateFields,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found with this Kaveri ID' });
    }

    res.status(200).json({
      message: 'User status updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = { 
  registerUser, 
  getUserByKaveriId,
  getAllUsers,
  updateVerificationStatus
};
