const UserCredits = require('../models/userCreditsModel');
const CreditLog = require('../models/creditLogModel');

const addTotalCredits = async (req, res) => {
  try {
    const { kaveriId, amount } = req.body;

    if (!kaveriId || amount == null) {
      return res.status(400).json({ message: 'kaveriId and amount are required' });
    }

    const userCredits = await UserCredits.findOne({ kaveriId });
    if (!userCredits) {
      return res.status(404).json({ message: 'UserCredits not found for this kaveriId' });
    }

    // Add amount to totalCredits
    userCredits.totalCredits += Number(amount);
    await userCredits.save();

    // ✅ Log the credit addition
    await CreditLog.create({
      kaveriId,
      amount: Number(amount),
      addedAt: new Date()
    });

    // Emit real-time update if socket.io is used
    const io = req.app.get('io');
    if (io) {
      io.to(kaveriId).emit('availableCreditsUpdated', {
        availableCredits: userCredits.totalCredits - userCredits.usedCredits
      });
    }

    res.status(200).json({ 
      message: 'Total credits updated successfully',
      availableCredits: userCredits.totalCredits - userCredits.usedCredits
    });

  } catch (error) {
    console.error('Error updating totalCredits:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addUsedCredits = async (req, res) => {
  try {
    const { kaveriId, amount } = req.body;

    if (!kaveriId || amount == null) {
      return res.status(400).json({ message: 'kaveriId and amount are required' });
    }

    const userCredits = await UserCredits.findOne({ kaveriId });
    if (!userCredits) {
      return res.status(404).json({ message: 'UserCredits not found for this kaveriId' });
    }

    const newUsedCredits = userCredits.usedCredits + Number(amount);
    if (newUsedCredits > userCredits.totalCredits) {
      return res.status(400).json({ message: 'Not enough credits available' });
    }

    userCredits.usedCredits = newUsedCredits;
    await userCredits.save();

    // Emit standardized update
    const io = req.app.get('io');
    if (io) {
      io.to(kaveriId).emit('availableCreditsUpdated', {
        availableCredits: userCredits.totalCredits - userCredits.usedCredits
      });
    }

    res.status(200).json({ 
      message: 'Used credits updated successfully',
      availableCredits: userCredits.totalCredits - userCredits.usedCredits
    });

  } catch (error) {
    console.error('Error updating usedCredits:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// New function to get current credits
const getCurrentCredits = async (req, res) => {
  try {
    const { kaveriId } = req.params;
    
    const userCredits = await UserCredits.findOne({ kaveriId });
    if (!userCredits) {
      return res.status(404).json({ message: 'UserCredits not found' });
    }

    res.status(200).json({
      availableCredits: userCredits.totalCredits - userCredits.usedCredits,
      totalCredits: userCredits.totalCredits,
      usedCredits: userCredits.usedCredits
    });

  } catch (error) {
    console.error('Error getting current credits:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCreditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { kaveriId } = req.params;

    if (!kaveriId) {
      return res.status(400).json({ message: 'kaveriId is required in the URL' });
    }

    const query = { kaveriId };

    const logs = await CreditLog.find(query)
      .sort({ addedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalLogs = await CreditLog.countDocuments(query);

    res.status(200).json({
      logs,
      pagination: {
        total: totalLogs,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalLogs / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching credit logs:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllCredits = async (req, res) => {
  try {
    // Get all user credit summaries
    const allCredits = await UserCredits.find().sort({ updatedAt: -1 });

    // Get all logs (you can paginate if needed)
    const allLogs = await CreditLog.find().sort({ addedAt: -1 });

    res.status(200).json({
      users: allCredits,
      logs: allLogs
    });
  } catch (error) {
    console.error('Error fetching all credits:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  addTotalCredits,
  addUsedCredits,
  getCurrentCredits,
  getCreditLogs,
  getAllCredits
};
