const User = require('../models/User');
const {Item} = require('../models/Item');

const blockUser = async (req, res) => {
  const userId = req.user._id;
  const blockId = req.params.id;

  if (userId.toString() === blockId) {
    return res.status(400).json({ message: "Cannot block yourself" });
  }

  await User.findByIdAndUpdate(userId, {
    $addToSet: { blockedUsers: blockId }
  });

  res.json({ success: true, blockedId: blockId });
};

const unblockUser = async (req, res) => {
  const userId = req.user._id;
  const unblockId = req.params.id;

  await User.findByIdAndUpdate(userId, {
    $pull: { blockedUsers: unblockId }
  });

  res.json({ success: true, unblockedId: unblockId });
};

const getBlockedUsers = async (req, res) => {
  const user = await User.findById(req.user._id).populate('blockedUsers', 'username fullName avatar');
  res.json(user.blockedUsers);
};

const hideItem = async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  await User.findByIdAndUpdate(userId, {
    $addToSet: { hiddenItems: itemId }
  });

  res.json({ success: true });
};

const hideAuthorPosts = async (req, res) => {
  const userId = req.user._id;
  const { authorId } = req.params;

  if (authorId.toString() === userId.toString()) {
    return res.status(400).json({ message: "You cannot hide your own posts" });
  }

  await User.findByIdAndUpdate(userId, {
    $addToSet: { hiddenAuthors: authorId }
  });

  res.json({ success: true });
};

const getHiddenItems = async (req, res) => {
  const user = await User.findById(req.user._id).select('hiddenItems').lean();
  const items = await Item.find({ _id: { $in: user.hiddenItems } })
    .populate('author', 'username fullName avatar')
    .lean();

  res.json(items);
};

const getHiddenAuthors = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('hiddenAuthors', 'username fullName avatar')
    .select('hiddenAuthors')
    .lean();

  res.json(user.hiddenAuthors);
};

const unhideItem = async (req, res) => {
  const { itemId } = req.params;

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { hiddenItems: itemId }
  });

  res.json({ success: true, unhiddenItemId: itemId });
};

const unhideAuthorPosts = async (req, res) => {
  const { authorId } = req.params;

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { hiddenAuthors: authorId }
  });

  res.json({ success: true, unhiddenAuthorId: authorId });
};

module.exports = {blockUser, unblockUser, getBlockedUsers, hideItem, hideAuthorPosts, getHiddenAuthors, getHiddenItems, unhideAuthorPosts, unhideItem};