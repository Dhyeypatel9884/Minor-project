const { Message, Conversation } = require('../models/Message');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');


// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        let query = {};
        if (role === 'client') {
            query = { clientId: userId };
        } else {
            query = { studentId: userId };
        }

        const conversations = await Conversation.find(query)
            .sort({ lastMessageAt: -1 });

        res.json({ success: true, conversations });
    } catch (err) {
        console.error('Get conversations error:', err);
        res.status(500).json({ message: 'Server error fetching conversations' });
    }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:convId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const { convId } = req.params;

        const conversation = await Conversation.findById(convId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check access
        const userId = req.user._id.toString();
        if (conversation.clientId.toString() !== userId && conversation.studentId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }

        const messages = await Message.find({ conversationId: convId }).sort({ createdAt: 1 });
        res.json({ success: true, messages });
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

// @desc    Send a message in a conversation
// @route   POST /api/messages/:convId
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { convId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Message text is required' });
        }

        const conversation = await Conversation.findById(convId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check access
        const userId = req.user._id.toString();
        if (conversation.clientId.toString() !== userId && conversation.studentId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to send messages here' });
        }

        const message = await Message.create({
            conversationId: convId,
            senderId: req.user._id,
            senderName: req.user.fullName,
            senderRole: req.user.role,
            text: text.trim()
        });

        // Update conversation's lastMessage
        await Conversation.findByIdAndUpdate(convId, {
            lastMessage: text.trim(),
            lastMessageAt: new Date()
        });

        // Create notification for the recipient
        const recipientId = conversation.clientId.toString() === userId ? conversation.studentId : conversation.clientId;
        await Notification.create({
            recipientId,
            message: `New message from ${req.user.fullName} regarding "${conversation.projectTitle}"`,
            type: 'new_message',
            link: '/messages'
        });

        res.status(201).json({ success: true, message });

    } catch (err) {
        console.error('Send message error:', err);
        res.status(500).json({ message: 'Server error sending message' });
    }
};

// @desc    Create or get a conversation between client and student for a project
// @route   POST /api/messages/conversations
// @access  Private (Client)
exports.createOrGetConversation = async (req, res) => {
    try {
        const { studentId, studentName, projectId, projectTitle } = req.body;

        if (!studentId || !projectId) {
            return res.status(400).json({ message: 'studentId and projectId are required' });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            projectId,
            clientId: req.user._id,
            studentId
        });

        if (!conversation) {
            const studentAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName || 'Student')}`;
            conversation = await Conversation.create({
                projectId,
                projectTitle: projectTitle || '',
                clientId: req.user._id,
                clientName: req.user.fullName,
                studentId,
                studentName: studentName || '',
                studentAvatar,
                lastMessage: '',
                lastMessageAt: new Date()
            });
        }

        res.status(201).json({ success: true, conversation });
    } catch (err) {
        console.error('Create conversation error:', err);
        if (err.code === 11000) {
            // Race condition — conversation exists, find and return it
            const conversation = await Conversation.findOne({
                projectId: req.body.projectId,
                clientId: req.user._id,
                studentId: req.body.studentId
            });
            return res.json({ success: true, conversation });
        }
        res.status(500).json({ message: 'Server error creating conversation' });
    }
};
