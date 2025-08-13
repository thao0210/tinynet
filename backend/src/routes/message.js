const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/messages', authMiddleware, messageController.sendMessage);
router.get('/messages', authMiddleware, messageController.getInbox);
router.get('/messages/inbox', authMiddleware, messageController.getInbox);
router.get('/messages/sent', authMiddleware, messageController.getSent);
router.patch('/messages/markRead', authMiddleware, messageController.markAsRead);
router.delete('/messages', authMiddleware, messageController.deleteMultipleMessages);
router.get('/messages/count', authMiddleware, messageController.countMessage);
router.post('/messages/resetCount', authMiddleware, messageController.resetMessagesCount);

module.exports = router;