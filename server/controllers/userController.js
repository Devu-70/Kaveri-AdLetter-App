// const User = require('../models/userModel');
// const UserCredits = require('../models/userCreditsModel');
// const bcrypt = require('bcrypt');

// // Generate custom Kaveri ID
// const generateKaveriId = (name) => {
//   const now = new Date();
// //   const date = now.getDate().toString().padStart(2, '0');
//   const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
//   const year = now.getFullYear().toString().slice(-2);
//   const first3 = name.slice(0, 3).toUpperCase();
//   const time = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
//   return `${month}${year}${first3}${time}`;
// };

// const registerUser = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       contact,
//       consultancyName,
//       consultancyLocation,
//       password
//     } = req.body;

//     if (!name || !email || !contact || !consultancyName || !consultancyLocation || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     const existingUser = await User.findOne({ $or: [{ email }, { contact }] });

//     if (existingUser) {
//       if (existingUser.email === email) {
//         return res.status(409).json({ message: 'User already exists with this email' });
//       }
//       if (existingUser.contact === contact) {
//         return res.status(409).json({ message: 'User already exists with this contact number' });
//       }
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const kaveriId = generateKaveriId(name);

//     const newUser = new User({
//       name,
//       email,
//       contact,
//       consultancyName,
//       consultancyLocation,
//       kaveriId,
//       password: hashedPassword,
//       role: 'agent'
//     });

//     await newUser.save();

//     const userCredits = new UserCredits({
//       userId: newUser._id,
//       kaveriId: newUser.kaveriId,
//       name: newUser.name,
//       totalCredits: 0,
//       usedCredits: 0
//     });

//     await userCredits.save();

//     res.status(201).json({ message: 'Registered successfully' });

//   } catch (error) {
//     console.error('Signup error:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


// // Get user details by Kaveri ID
// // const getUserByKaveriId = async (req, res) => {
// //   try {
// //     const { kaveriId } = req.params;
// //     const user = await User.findOne({ kaveriId });

// //     if (!user) {
// //       return res.status(404).json({ message: 'User not found with this Kaveri ID' });
// //     }

// //     const userCredits = await UserCredits.findOne({ kaveriId });

// //     let availableCredits = null;
// //     if (userCredits) {
// //       availableCredits = userCredits.totalCredits - userCredits.usedCredits;
// //     }

// //     res.status(200).json({ 
// //       user, 
// //       credits: userCredits || null,
// //       availableCredits 
// //     });

// //   } catch (error) {
// //     console.error('Error fetching user by Kaveri ID:', error.message);
// //     res.status(500).json({ message: 'Internal server error' });
// //   }
// // };


// const getUserByKaveriId = async (req, res) => {
//   try {
//     const { kaveriId } = req.params;
//     const io = req.app.get('io');  // get socket.io instance

//     const user = await User.findOne({ kaveriId });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found with this Kaveri ID' });
//     }

//     const userCredits = await UserCredits.findOne({ kaveriId });

//     let availableCredits = null;
//     if (userCredits) {
//       availableCredits = userCredits.totalCredits - userCredits.usedCredits;
//     }

//     // Emit live update event to clients in this user's room (optional)
//     io.to(kaveriId).emit('availableCreditsUpdated', { availableCredits });

//     res.status(200).json({ 
//       user, 
//       credits: userCredits || null,
//       availableCredits 
//     });

//   } catch (error) {
//     console.error('Error fetching user by Kaveri ID:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


// module.exports = { registerUser, getUserByKaveriId };


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

module.exports = { 
  registerUser, 
  getUserByKaveriId 
};