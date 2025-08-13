const mongoose = require("mongoose");

const postViewSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // có thể null
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PostView", postViewSchema);
