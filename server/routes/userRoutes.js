const express = require('express');
const router = express.Router();

const { registerUser, getUserByKaveriId, getAllUsers, updateVerificationStatus } = require('../controllers/userController');
const loginUser = require('../controllers/authController');
const { verifyToken } = require('../middleware/tokenVerify');

const {
    createLetter,
    getAllLetters,
    getLettersByKaveriId,
    updateAuthorizationStatus
} = require('../controllers/lettersGeneratedController');

const {
    addTotalCredits,
    addUsedCredits,
    getCreditLogs,
    getAllCredits
} = require('../controllers/creditUsageController');

// User Routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/getall', getAllUsers);
router.put('/verify/:kaveriId', updateVerificationStatus);


// LettersGenerated Routes
router.post('/letters', createLetter);
router.get('/letters', getAllLetters);
router.get('/letters/:kaveriId', getLettersByKaveriId);
router.patch('/:id/authorize', updateAuthorizationStatus);

// Credit Management Routes
router.post('/credits/add-total', addTotalCredits); 
router.post('/credits/add-used', addUsedCredits);  
router.get('/credits', getAllCredits);
router.get('/credit-logs/:kaveriId', getCreditLogs);


router.get('/:kaveriId', verifyToken, getUserByKaveriId);

module.exports = router;
