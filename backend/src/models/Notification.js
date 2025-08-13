const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User nhận thông báo
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Ai thực hiện hành động
    type: String, // "like", "comment", "follow", "sendPoints"
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: false }, // Nếu là bài viết
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: false }, // Nếu là comment
    points: {type: Number}, // Neu la sendPoints
    noOfVotes: { type: Number},
    winnerReward: {type: Number},
    isRead: { type: Boolean, default: false }, // Đã đọc chưa?
    isCounted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  });
  
notificationSchema.index({ user: 1, isRead: 1 });
module.exports = mongoose.model('Notification', notificationSchema);
  