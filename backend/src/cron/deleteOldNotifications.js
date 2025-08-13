const cron = require("node-cron");
const Notification = require("../models/Notification");

function deleteOldNotificationsJob() {
// Chạy lúc 12:00 AM mỗi ngày
cron.schedule("0 0 * * *", async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await Notification.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
    console.log("Deleted old notifications");
  } catch (error) {
    console.error("Error deleting old notifications:", error);
  }
})
};

module.exports = deleteOldNotificationsJob;