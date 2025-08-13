const cron = require("node-cron");
const PointsHistory = require('../models/PointsHistory');

function deleteOldPointsHistoryJob() {
// Chạy mỗi tuần vào Chủ Nhật lúc 03:00 sáng
    cron.schedule('0 3 * * 0', async () => {
        try {
        const sixMonthsAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90); // 90 ngày
        const result = await PointsHistory.deleteMany({ createdAt: { $lt: sixMonthsAgo } });
    
        console.log(`[CRON] Delete ${result.deletedCount} old PointsHistory.`);
        } catch (error) {
        console.error('[CRON] Lỗi khi xoá PointsHistory:', error);
        }
    })
};

  module.exports = deleteOldPointsHistoryJob;
