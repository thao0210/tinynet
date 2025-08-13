const cron = require("node-cron");
const PostLike = require('../models/PostLike');
const PostView = require('../models/PostView');
const CommentLike = require('../models/CommentLike');
const {
  getTopUsersByField,
  getTopItemsByField,
  getTopCommentsByLikes,
  getWeekNumberSince
} = require("../utils/championService");
const { getStartOfWeekInUTC7, getEndOfWeekInUTC7 } = require("../utils/timeUtils");
const PointsHistory = require('../models/PointsHistory');
const {updateUserPoints} = require("../utils/points");

const getAwardForRank = (rank) => {
  if (rank === 1) return 200;
  if (rank === 2) return 150;
  if (rank === 3) return 100;
  return 30;
};

const runWeeklyChampionJob = async () => {
  try {
    const start = getStartOfWeekInUTC7();
    const end = getEndOfWeekInUTC7();
    const weekNumber = getWeekNumberSince("2025-04-01");

    const topFields = [
        { key: "userPoints", type: "user", label: "Top Points Users" },
        { key: "noOfPosts", type: "user", label: "Top Posted Users" },
        { key: "noOfComments", type: "user", label: "Top Comments Users" },
        { key: "views", type: "item", label: "Top Views Post" },
        { key: "noOfComments", type: "item", label: "Top Commented Post" },
        { key: "noOfLikes", type: "item", label: "Top Likes Post" },
        { key: "noOfLikes", type: "comment", label: "Top Comments By Likes" },
      ];
  
      for (const field of topFields) {
        let topList = [];
  
        if (field.type === "user") {
          topList = await getTopUsersByField(field.key, start, end);
        } else if (field.type === "item") {
          topList = await getTopItemsByField(field.key, start, end);
        } else if (field.type === "comment") {
          topList = await getTopCommentsByLikes({startDate: start, enDate: end});
        }
  
        for (let i = 0; i < topList.length; i++) {
          const award = getAwardForRank(i + 1);
          const user = topList[i].author || topList[i]; // author (item/comment) or direct user
  
          if (user && user._id) {
            await updateUserPoints(user._id, award);
            await PointsHistory.create({
              userId: user._id,
              points: award,
              description: `Weekly award - week ${weekNumber}: No ${i + 1} in ${field.label}`,
              seen: false
            });
          }
        }
      }

    console.log("✅ Weekly Champion Job executed successfully.");
  } catch (error) {
    console.error("❌ Error in Weekly Champion Job:", error);
  }
};

const cleanupPostStats = async () => {
  try {
    const like = await PostLike.deleteMany({});
    const view = await PostView.deleteMany({});
    const commentLike = await CommentLike.deleteMany({});
    console.log(`🧹 Cleanup done: ${like.deletedCount} likes, ${view.deletedCount} views, ${commentLike.deletedCount} comment likes`);
  } catch (err) {
    console.error("❌ Error during post stats cleanup:", err);
  }
};
// 🕐 Schedule job to run every Monday at 00:05 AM (Asia/Ho_Chi_Minh timezone ≈ UTC+7)
// Adjust server timezone if needed.
cron.schedule("5 0 * * 1", async () => {
  console.log("🕒 Running Weekly Champion Job...");
  await runWeeklyChampionJob();
  await cleanupPostStats();
});

module.exports = runWeeklyChampionJob;
