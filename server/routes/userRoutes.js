const express = require('express');
const router = express.Router();

const { registerUser, getUserByKaveriId } = require('../controllers/userController');
const loginUser = require('../controllers/authController');
const { verifyToken } = require('../middleware/tokenVerify');

const {
    createLetter,
    getAllLetters,
    getLettersByKaveriId
} = require('../controllers/lettersGeneratedController');

const {
    addTotalCredits,
    addUsedCredits,
    getCreditLogs
} = require('../controllers/creditUsageController');

// User Routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/:kaveriId', verifyToken, getUserByKaveriId);

// LettersGenerated Routes
router.post('/letters', createLetter);
router.get('/letters', getAllLetters);
router.get('/letters/:kaveriId', getLettersByKaveriId);

// Credit Management Routes
router.post('/credits/add-total', addTotalCredits); 
router.post('/credits/add-used', addUsedCredits);  
router.get('/credit-logs/:kaveriId', getCreditLogs);

module.exports = router;
