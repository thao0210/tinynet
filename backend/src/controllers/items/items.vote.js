const {Item} = require('../../models/Item');
const User = require('../../models/User');
const {createNotification} = require('../notificationController');
const {findItemByIdOrSlug} = require('../../utils/itemUtils');
const PointsHistory = require('../../models/PointsHistory');

const voteItem = async (req, res) => {
  const { itemId } = req.params; // vote _id
  const { userId, votedItemId } = req.body;

  const voteParent = await findItemByIdOrSlug(itemId);
  if (!voteParent) return res.status(404).send("Vote item not found");

  // Chặn khi hết hạn vote
  const now = new Date();
  if (now > new Date(voteParent.deadline)) {
    return res.status(403).send("Voting has ended");
  }

  // Chặn khi maxVoters đã hết
  if (voteParent.maxVoters !== 0 && voteParent.maxVoters <= 0) {
    return res.status(403).send("No more votes allowed");
  }

  const votedIds = Array.isArray(votedItemId) ? votedItemId : [votedItemId];
  let pointsEarned = 0;

  for (const id of votedIds) {
    const itemView = voteParent.itemsView.find(
      (i) => i.item.toString() === id
    );
    if (!itemView) continue; // Không tìm thấy item để vote

    // Nếu user đã vote item này thì bỏ qua
    if (itemView.votedUsers.some((u) => u.toString() === userId)) {
      continue;
    }

    // Thêm user vào danh sách voted
    itemView.votedUsers.push(userId);
    itemView.noOfVotes += 1;

    // Tính điểm thưởng
    pointsEarned += voteParent.voteReward || 1;

    // Giảm maxVoters nếu có giới hạn
    if (voteParent.maxVoters > 0) {
      voteParent.maxVoters -= 1;
    }
  }

  // Lưu lại thay đổi voteParent
  await voteParent.save();

  // Nếu có điểm thưởng
  if (pointsEarned > 0) {
    // Cộng cho người vote
    await User.findByIdAndUpdate(userId, {
      $inc: { points: pointsEarned },
    });
    await PointsHistory.create({ userId: userId, points: pointsEarned, description: 'Voted on a post' });
    // Trừ của tác giả
    if (voteParent.author) {
      await User.findByIdAndUpdate(voteParent.author, {
        $inc: { points: -pointsEarned },
      });
      await PointsHistory.create({ userId: voteParent.author, points: -pointsEarned, description: 'Someone voted on your post (points deducted)' });
    }
  }

  res.send({ success: true, points: pointsEarned, maxVoters: voteParent.maxVoters });
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