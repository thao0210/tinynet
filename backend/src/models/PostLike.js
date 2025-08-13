const mongoose = require("mongoose");

const postLikeSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

postLikeSchema.index({ itemId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("PostLike", postLikeSchema);
