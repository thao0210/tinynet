const deleteOldPointsHistoryJob = require('./deleteOldPointsHistory');
const deleteOldNotificationsJob = require('./deleteOldNotifications');
const runWeeklyChampionJob = require('./runWeeklyChampionJob');

function startAllCrons() {
  deleteOldPointsHistoryJob();
  deleteOldNotificationsJob();
  runWeeklyChampionJob();
  console.log('[CRON] Đã khởi động toàn bộ cron jobs.');
}

module.exports = startAllCrons;