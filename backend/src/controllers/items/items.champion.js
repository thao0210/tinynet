const Comment = require('../../models/Comment');
const { getTopItemsByField, getTopUsersByField, getWeekNumberSince } = require('../../utils/championService');
const { getStartOfWeekInUTC7, getEndOfWeekInUTC7, getNextResetTimeISO } = require('../../utils/timeUtils');
const PointsHistory = require('../../models/PointsHistory');
const PostView = require('../../models/PostView');
const PostLike = require('../../models/PostLike');
const CommentLike = require('../../models/CommentLike');
const { Item } = require('../../models/Item');

const getTopUsers = async (req, res) => {
    try {
      const {sortBy = "userPoints", userId } = req.query;
      // Kiểm tra sortBy hợp lệ
      const validSortFields = ["userPoints", "noOfComments", "noOfPosts"];
      if (!validSortFields.includes(sortBy)) {
        return res.status(400).json({ message: "Invalid sortBy parameter" });
      }
      
      const startOfWeek = getStartOfWeekInUTC7();
      const endOfWeek = new Date();
      // const topUsers = await getTopUsersByField(sortBy, startOfWeek);
      if (sortBy === "userPoints") {
        topUsers = await getTopUsersByPoints(startOfWeek, endOfWeek);
      } else if (sortBy === "noOfPosts") {
        topUsers = await getTopUsersByPosts(startOfWeek, endOfWeek);
      } else if (sortBy === "noOfComments") {
        topUsers = await getTopUsersByComments(startOfWeek, endOfWeek);
      }
  
      res.json({ topUsers });
    } catch (error) {
      res.status(500).json({ message: "Error fetching top users", error });
    }
  };

const getTopUsersByPoints = async (startDate, endDate) => {
  const topUsers = await PointsHistory.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: "$userId", totalPoints: { $sum: "$points" } } },
    { $sort: { totalPoints: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: "$user._id",
        fullName: "$user.fullName",
        username: "$user.username",
        avatar: "$user.avatar",
        userPoints: "$totalPoints"
      }
    }
  ]);

  return topUsers.map((u, index) => ({ ...u, rank: index + 1, award: [200, 150, 100][index] || 30 }));
};

const getTopUsersByPosts = async (startDate, endDate) => {
  const top = await Item.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: "$author", noOfPosts: { $sum: 1 } } },
    { $sort: { noOfPosts: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: "$user._id",
        username: "$user.username",
        fullName: "$user.fullName",
        avatar: "$user.avatar",
        noOfPosts: 1
      }
    }
  ]);

  return top.map((u, i) => ({ ...u, rank: i + 1, award: [200, 150, 100][i] || 30 }));
};

const getTopUsersByComments = async (startDate, endDate) => {
  const top = await Comment.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: "$author", noOfComments: { $sum: 1 } } },
    { $sort: { noOfComments: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: "$user._id",
        username: "$user.username",
        fullName: "$user.fullName",
        avatar: "$user.avatar",
        noOfComments: 1
      }
    }
  ]);

  return top.map((u, i) => ({ ...u, rank: i + 1, award: [200, 150, 100][i] || 30 }));
};

const getTopPosts = async (req, res) => {
    try {
      const { sortBy = "views", type} = req.query;
  
      // Kiểm tra sortBy hợp lệ
      const validSortFields = ["views", "noOfComments", "noOfLikes"];
      if (!validSortFields.includes(sortBy)) {
        return res.status(400).json({ message: "Invalid sortBy parameter" });
      }
    
      // this_week hoặc mặc định
      const startDate = getStartOfWeekInUTC7();
      const endDate = new Date();

      let posts = [];
      if (sortBy === "views") {
        posts = await getTopPostsByViews(startDate, endDate);
      } else if (sortBy === "noOfLikes") {
        posts = await getTopPostsByLikes(startDate, endDate);
      } else if (sortBy === "noOfComments") {
        posts = await getTopPostsByComments(startDate, endDate);
      }
  
      res.json({ posts });
    } catch (error) {
      res.status(500).json({ message: "Error fetching top posts", error });
    }
  };

  const getTopPostsByViews = async (startDate, endDate) => {
  const results = await PostView.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: "$itemId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $lookup: { from: "items", localField: "_id", foreignField: "_id", as: "item" } },
    { $unwind: "$item" },
    { $lookup: { from: "users", localField: "item.author", foreignField: "_id", as: "author" } },
    { $unwind: "$author" },
    {
      $project: {
        itemId: "$item._id",
        title: "$item.title",
        type: "$item.type",
        views: "$count",
        author: {
          username: "$author.username",
          fullName: "$author.fullName",
          avatar: "$author.avatar"
        }
      }
    }
  ]);

  return results.map((p, i) => ({ ...p, rank: i + 1, award: [200, 150, 100][i] || 30 }));
};

const getTopPostsByLikes = async (startDate, endDate) => {
  const results = await PostLike.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: "$itemId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $lookup: { from: "items", localField: "_id", foreignField: "_id", as: "item" } },
    { $unwind: "$item" },
    { $lookup: { from: "users", localField: "item.author", foreignField: "_id", as: "author" } },
    { $unwind: "$author" },
    {
      $project: {
        itemId: "$item._id",
        title: "$item.title",
        type: "$item.type",
        noOfLikes: "$count",
        author: {
          username: "$author.username",
          fullName: "$author.fullName",
          avatar: "$author.avatar"
        }
      }
    }
  ]);

  return results.map((p, i) => ({ ...p, rank: i + 1, award: [200, 150, 100][i] || 30 }));
};

const getTopPostsByComments = async (startDate, endDate) => {
  const results = await Comment.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: "$itemId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $lookup: { from: "items", localField: "_id", foreignField: "_id", as: "item" } },
    { $unwind: "$item" },
    { $lookup: { from: "users", localField: "item.author", foreignField: "_id", as: "author" } },
    { $unwind: "$author" },
    {
      $project: {
        itemId: "$item._id",
        title: "$item.title",
        type: "$item.type",
        noOfComments: "$count",
        author: {
          username: "$author.username",
          fullName: "$author.fullName",
          avatar: "$author.avatar"
        }
      }
    }
  ]);

  return results.map((p, i) => ({ ...p, rank: i + 1, award: [200, 150, 100][i] || 30 }));
};

  const getTopCommentsByLikesHandle = async (req, res) => {
    try {
    const startDate = getStartOfWeekInUTC7();
    const endDate = new Date();
      
    const comments = await getTopCommentsByLikes(startDate, endDate);
    const ranked = comments.map((c, i) => ({ ...c, rank: i + 1, award: [200, 150, 100][i] || 30 }));
  
      res.json({ topComments: ranked });
    } catch (error) {
      res.status(500).json({ message: "Error fetching top comments by likes", error });
    }
  };

  const getTopCommentsByLikes = async (startDate, endDate) => {
  const results = await CommentLike.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: "$commentId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $lookup: { from: "comments", localField: "_id", foreignField: "_id", as: "comment" } },
    { $unwind: "$comment" },
    { $lookup: { from: "users", localField: "comment.author", foreignField: "_id", as: "author" } },
    { $unwind: "$author" },
    {
      $project: {
        commentId: "$comment._id",
        content: "$comment.content",
        itemId: "$comment.itemId",
        noOfLikes: "$count",
        author: {
          username: "$author.username",
          fullName: "$author.fullName",
          avatar: "$author.avatar"
        }
      }
    }
  ]);

  return results;
};
  const nextReset = async (req, res) => {
    const weekNumber = getWeekNumberSince("2025-08-16");
    const nextReset = getNextResetTimeISO(); // ISO string
    res.json({week: weekNumber, nextReset});
  };
  

  const getMyUnseenWeeklyAward = async (req, res) => {
    try {
      const unseenAwards = await PointsHistory.find({
          userId: req.user.id,
          description: { $regex: "Weekly award", $options: "i" },
          seen: false
        }).sort({ createdAt: -1 });

      if (!unseenAwards.length) return res.json({ hasNewAward: false });
  
      res.json({ hasNewAward: true, awards: unseenAwards });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const markAwardAsSeen = async (req, res) => {
    try {
      await PointsHistory.updateMany({
        userId: req.user.id,
        description: { $regex: "Weekly award", $options: "i" },
        seen: false
      }, {
        $set: { seen: true }
      });
  
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to mark as seen" });
    }
  };
module.exports = {getTopUsers, getTopPosts, getTopCommentsByLikesHandle, nextReset, getMyUnseenWeeklyAward, markAwardAsSeen};