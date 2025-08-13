const express = require('express');
const { countNotifications, getNotifications, markNotificationsAsRead, markNotificationRead, resetNotificationsCount, deleteNotification} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/notifications/count', authMiddleware, countNotifications);
router.get('/notifications', authMiddleware, getNotifications);
router.put('/notifications/markRead', authMiddleware, markNotificationsAsRead);
router.post('/notifications/:id/markRead', authMiddleware, markNotificationRead);
router.delete('/notifications/:id', authMiddleware, deleteNotification);
router.post('/notifications/resetCount', authMiddleware, resetNotificationsCount);

module.exports = router;