const User = require('../models/User');
const {Item} = require('../models/Item');
const Comment = require("../models/Comment");

const getWeekNumberSince = (baseDate = "2025-01-01") => {
  const start = new Date(baseDate);
  const now = new Date();

  const diffInMs = now - start;
  const diffInWeeks = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000));

  return diffInWeeks + 1; // Vì tuần đầu tiên là Week 1
};

const getTopUsersByField = async (field, startDate, endDate) => {
  const users = await User.aggregate([
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        [field]: 1
      }
    },
    {
      $sort: { [field]: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Gán award tương ứng
  return users.map((user, index) => {
    let award = 30;
    if (index === 0) award = 200;
    else if (index === 1) award = 150;
    else if (index === 2) award = 100;

    return {
      ...user,
      rank: index + 1,
      award
    };
  });
};

const getTopItemsByField = async (field, options = {}) => {
    const { type = null, startDate = null, endDate = null, limit = 10 } = options;
  
    const filter = {};
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }
  
    const items = await Item.find(filter)
      .sort({ [field]: -1 })
      .limit(limit)
      .select("title author type views noOfComments noOfLikes")
      .populate("author", "username fullName avatar");
  
    // Gán award theo vị trí
    return items.map((item, i) => ({
      ...item.toObject(),
      rank: i + 1,
      award: [200, 150, 100][i] || 30
    }));
  };

  const getTopCommentsByLikes = async (options = {}) => {
    const { type = null, startDate = null, endDate = null, limit = 10 } = options;
  
    const filter = {};
    if (type) filter.postType = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }
  
    const comments = await Comment.find(filter)
      .sort({ noOfLikes: -1 })
      .limit(limit)
      .select("content noOfLikes itemId author")
      .populate("author", "fullName username avatar");
  
    // return comments.map((comment, index) => ({
    //   ...comment.toObject(),
    //   rank: index + 1,
    //   award:
    //     index === 0 ? 200 :
    //     index === 1 ? 150 :
    //     index === 2 ? 100 : 30
    // }));
    return comments;
  };
module.exports = {
  getTopUsersByField,
  getTopItemsByField,
  getTopCommentsByLikes,
  getWeekNumberSince
};