const express = require('express');
const router = express.Router();
const {
    getConversations,
    getMessages,
    sendMessage,
    createOrGetConversation
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Specific named routes BEFORE parameterized ones
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, createOrGetConversation);

// Parameterized — must come AFTER
router.get('/:convId', protect, getMessages);
router.post('/:convId', protect, sendMessage);

module.exports = router;
