const {Item} = require('../../models/Item');
const User = require('../../models/User');
const {createNotification} = require('../notificationController');
const {findItemByIdOrSlug} = require('../../utils/itemUtils');

const voteItem = async (req, res) => {
  const { itemId } = req.params; // vote _id
  const { userId, votedItemId } = req.body; // có thể là 1 ID hoặc 1 mảng ID

  
  const voteParent = await findItemByIdOrSlug(itemId);
  if (!voteParent) return res.status(404).send("Vote item not found");

  const now = new Date();
  if (now > new Date(voteParent.deadline)) {
    return res.status(403).send("Voting has ended");
  }

  const votedIds = Array.isArray(votedItemId) ? votedItemId : [votedItemId];
  let pointsEarned = 0;

  for (const id of votedIds) {
    const itemView = voteParent.itemsView.find(i => i.item.toString() === id);
    if (!itemView) continue; // Bỏ qua nếu không tìm thấy

    if (itemView.votedUsers.some(u => u.toString() === userId)) {
      continue; // Bỏ qua nếu đã vote
    }

    itemView.votedUsers.push(userId);
    itemView.noOfVotes += 1;
    pointsEarned += voteParent.voteReward || 1;
  }

  await voteParent.save();

  if (pointsEarned > 0) {
    await User.findByIdAndUpdate(userId, {
      $inc: { points: pointsEarned }
    });
  }

  res.send({ success: true, points: pointsEarned });
};


// GET /api/vote/result/:itemId
const getVoteResult = async (req, res) => {
  const { itemId } = req.params;
  const { userId } = req.query;

  const item = await findItemByIdOrSlug(itemId)
    .populate("itemsView.item", "author title")
    .lean();

  if (!item) return res.status(404).send("Item not found");

  const now = new Date();
  if (now < new Date(item.deadline)) {
    return res.status(400).send("Voting is still ongoing");
  }

  if (!item.itemsView || item.itemsView.length === 0) {
    // Không có ai vote ⇒ trả về kết quả rỗng
    return res.send({
      topVoted: 0,
      allVotes: [],
    });
  }

  const sorted = [...item.itemsView].sort((a, b) => b.noOfVotes - a.noOfVotes);
  const top = sorted[0];

  if (!top || !top.item) {
    return res.send({
      topVoted: null,
      allVotes: item.itemsView.map(v => ({
        item: v.item,
        noOfVotes: v.noOfVotes,
      }))
    });
  }

  // Gửi thông báo nếu không phải custom vote
  if (!item.isCustom) {
    const winnerUserId = top.item.author;
    if (winnerUserId) {
      await createNotification({
        user: winnerUserId,
        sender: userId,
        type: "vote",
        noOfVotes: top.item.noOfVotes,
        winnerReward: item.winnerReward
      });

      await User.findByIdAndUpdate(winnerUserId, {
        $inc: { points: item.winnerReward || 50 },
      });
    }
  }

  res.send({
    topVoted: {
      item: top.item,
      noOfVotes: top.noOfVotes,
    },
    allVotes: item.itemsView.map(v => ({
      item: v.item,
      noOfVotes: v.noOfVotes,
    }))
  });
};

  module.exports = {voteItem, getVoteResult};  