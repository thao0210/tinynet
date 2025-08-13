const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, text } = req.body;
    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
      text
    });
    await message.save();
    res.json({ message: 'Sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      receiver: req.user._id,
      $or: [
        { isSystem: true },
        { deletedByReceiver: { $ne: true } }
      ]
    };

    const messagesRaw = await Message.find(filter)
      .populate('sender', 'fullName username avatar')
      .populate('receiver', 'fullName username avatar')
      .sort({ createdAt: -1 });

    // Lọc ra những message sẽ được hiển thị
    const messages = messagesRaw.filter((msg) => {
      // Nếu là system message thì luôn hiển thị
      if (msg.isSystem) return true;
      // Nếu không bị xóa bởi receiver
      return msg.deletedByReceiver !== true;
    }).map((msg) => {
      if (msg.isSystem) {
        return {
          ...msg.toObject(),
          message: 'Message is deleted by sender!'
        };
      }
      return msg;
    });

    const total = messages.length;
    const paginatedMessages = messages.slice(skip, skip + limit);

    res.json({
      messages: paginatedMessages,
      pagination: {
        page,
        total,
        pageCount: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
};


exports.getSent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const allMessages = await Message.find({ sender: req.user._id })
      .populate('sender', 'fullName username avatar')
      .populate('receiver', 'fullName username avatar')
      .sort({ createdAt: -1 });

    const visibleMessages = allMessages.filter(msg => !msg.deletedBySender);
    const total = visibleMessages.length;
    const paginatedMessages = visibleMessages.slice(skip, skip + limit);

    res.json({
      messages: paginatedMessages,
      pagination: {
        page,
        total,
        pageCount: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sent messages' });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  const message = await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
  res.json(message);
};

exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  await Message.findByIdAndDelete(id);
  res.json({ success: true });
};

exports.deleteMultipleMessages = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No message IDs provided." });
    }

    const messages = await Message.find({ _id: { $in: ids } });

    const bulkOps = [];

    for (const msg of messages) {
      const isSender = String(msg.sender) === userId;
      const isReceiver = String(msg.receiver) === userId;

      if (!isSender && !isReceiver) continue;

      if (isSender) {
        // Hard delete & gửi thông báo ảo cho người nhận
        const now = new Date();
        const sentTime = new Date(msg.createdAt);
        const diffMinutes = (now - sentTime) / (1000 * 60);

        if (diffMinutes <= 10) {
          // Xoá cứng
          bulkOps.push({
            deleteOne: { filter: { _id: msg._id }, update: { $set: { deletedBySender: true, isSystem: true } } },
          });
        } else {
          // Xoá mềm phía người gửi
          bulkOps.push({
            updateOne: {
              filter: { _id: msg._id },
              update: { $set: { deletedBySender: true, isSystem: false } },
            },
          });
        }
      }

      if (isReceiver) {
        // Soft delete phía receiver
        bulkOps.push({
          updateOne: {
            filter: { _id: msg._id },
            update: { $set: { deletedByReceiver: true } },
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await Message.bulkWrite(bulkOps);
    }

    res.json({ success: true, affected: bulkOps.length });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


exports.countMessage = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false, isCounted: false});
    res.json({ count: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count messages' });
  }
}

exports.resetMessagesCount = async (req, res) => {
    try {
      await Message.updateMany({ receiver: req.user._id, isRead: false, isCounted: false }, { $set: { isCounted: true } });
      res.json({ message: "Messages count reset" });
    } catch (error) {
      res.status(500).json({ message: "Error resetting count", error });
    }
  };
