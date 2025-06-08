const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function loginUser(req, res) { 
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    if (!user.verificationStatus) {
      return res.status(403).json({ message: 'Your verification is pending' });
    }

    // ✅ Include verificationStatus in the JWT payload
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        name: user.name,
        kaveriId: user.kaveriId,
        role: user.role,
        verificationStatus: user.verificationStatus // <-- ADD THIS
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        kaveriId: user.kaveriId,
        role: user.role,
        email: user.email,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = loginUser;
