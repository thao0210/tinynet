const express = require('express');
const { updateReportStatus, getReports, reportItem, reportComment, updateUserRole} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/report/item/:itemId', authMiddleware, reportItem);
router.post('/report/comment/:commentId', authMiddleware, reportComment);
router.put('/report/status/:reportId', authMiddleware, updateReportStatus);
router.get('/reports', authMiddleware, getReports);
router.put('/admin/updateRole/:userId', authMiddleware, updateUserRole);

module.exports = router;
