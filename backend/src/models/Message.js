const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  isCounted: { type: Boolean, default: false },

  isSystem: { type: Boolean, default: false },

  deletedBySender: { type: Boolean, default: false },   // Gửi nhưng đã xóa
  deletedByReceiver: { type: Boolean, default: false }, // Nhận nhưng đã xóa

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
