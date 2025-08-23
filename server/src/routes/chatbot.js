const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { queryChatbot, getCommonProblems, getLanguages } = require('../controllers/chatbotController');

// All chatbot routes require authentication
router.use(auth);

// Main chatbot query endpoint
router.post('/query', queryChatbot);

// Get common problems list
router.get('/problems', getCommonProblems);

// Get supported languages
router.get('/languages', getLanguages);

module.exports = router;
