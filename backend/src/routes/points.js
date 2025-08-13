const express = require('express');
const { dailyCheckin, updatePointsUser, sendPoints, getPointsHistory} = require('../controllers/pointsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/get-points-history', authMiddleware, getPointsHistory);
router.post('/send-points', authMiddleware, sendPoints);
router.post('/daily-checkin', authMiddleware, dailyCheckin);
router.post('/update-userPoints', authMiddleware, updatePointsUser);

module.exports = router;