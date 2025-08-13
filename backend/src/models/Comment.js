const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    date: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    noOfLikes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isLiked: {type: Boolean}
  });

module.exports = mongoose.model('Comment', CommentSchema);