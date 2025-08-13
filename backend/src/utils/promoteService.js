const {Item} = require('../models/Item');

const promotePost = async ({ itemId, duration }) => {
  const daysMap = {
    '1d': 1,
    '3d': 3,
    '7d': 7,
    '30d': 30,
  };

  const days = daysMap[duration];
  if (!days) {
    throw new Error('Invalid promote duration');
  }

  const item = await Item.findById(itemId);
  if (!item) {
    throw new Error('Item not found');
  }

  const now = new Date();
  const durationMs = days * 24 * 60 * 60 * 1000;

  let newStart = now;
  let newEnd;

  if (item.isPromoted && item.promoteEnd && item.promoteEnd > now) {
    // Nếu đang trong thời gian promote, cộng thêm vào promoteEnd
    newEnd = new Date(item.promoteEnd.getTime() + durationMs);
  } else {
    // Nếu đã hết hạn hoặc chưa từng promote
    newEnd = new Date(now.getTime() + durationMs);
    newStart = now;
  }

  item.isPromoted = true;
  item.promoteStart = newStart;
  item.promoteEnd = newEnd;

  const saved = await item.save();
  return saved;
};


module.exports = { promotePost };