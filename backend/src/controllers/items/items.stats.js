const {Item} = require('../../models/Item');
const viewCache = new Map(); // Bộ nhớ đệm tạm thời
const User = require('../../models/User');
const {updateUserRank} = require('../../utils/updateUserRank');
const {createNotification} = require('../../controllers/notificationController');
const { updateUserPoints } = require('../../utils/points');
const PointsHistory = require('../../models/PointsHistory');
const {findItemByIdOrSlug, updateItemByIdOrSlug} = require('../../utils/itemUtils');
const PostLike = require('../../models/PostLike');
const PostView = require('../../models/PostView');

const increaseViews = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // Lấy IP của user
    const cacheKey = `viewed_${userIp}_${itemId}`;
    const cooldown = 5 * 60 * 1000; // 5 phút

    // Kiểm tra nếu user đã xem trong thời gian cooldown
    const lastViewed = viewCache.get(cacheKey);
    if (lastViewed && Date.now() - lastViewed < cooldown) {
      const item = await findItemByIdOrSlug(itemId);
      return res.status(200).json({ views: item.views });
    }

    // Cập nhật views
    const updatedItem = await updateItemByIdOrSlug(
      itemId,
      { $inc: { views: 1 } },
      { new: true, select: "views" }
    );
    
    // ✅ Ghi log view
    await PostView.create({
      itemId: itemId,
      createdAt: new Date()
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Lưu vào cache với thời gian hết hạn
    viewCache.set(cacheKey, Date.now());
    setTimeout(() => viewCache.delete(cacheKey), cooldown); // Xóa cache sau cooldown

    // Cộng điểm cho chủ bài viết
    await updateUserPoints(updatedItem.author, 2);

    // Cập nhật userRank
    await updateUserRank(updatedItem.author);

    res.status(200).json({ views: updatedItem.views });
  } catch (err) {
    console.error("Error updating views:", err);
    res.status(500).json({ message: "Error updating views", error: err });
  }
};

const toggleLikeItem = async (req, res) => {
  try {
      const { itemId } = req.params;
      const userId = req.user.id; // Lấy userId từ token (Middleware xác thực)
      
      const item = await findItemByIdOrSlug(itemId);
      if (!item) return res.status(404).json({ message: "Item not found" });

      const hasLiked = item.likedBy.includes(userId);

      if (hasLiked) {
          // Unlike: Xóa userId khỏi danh sách likedBy
          item.likedBy = item.likedBy.filter(id => id.toString() !== userId);
          item.noOfLikes -= 1;

          await PostLike.deleteOne({ itemId: item._id, userId });
          // Tru điểm cho nguoi unlike
          await updateUserPoints(userId, -5);
          await PointsHistory.create({ userId: userId, points: -5, description: 'Unliked a post' });
          // Cập nhật userRank
          await updateUserRank(item.author);

      } else {
          // Like: Thêm userId vào danh sách likedBy
          item.likedBy.push(userId);
          item.noOfLikes += 1;
          
          await PostLike.updateOne(
            { itemId: item._id, userId },
            { $setOnInsert: { createdAt: new Date() } },
            { upsert: true }
          );
          // Cộng điểm cho chủ bài viết
            await updateUserPoints(item.author, 10);
            await PointsHistory.create({ userId: item.author, points: 10, description: 'Your post is liked' });
            // Cập nhật userRank
            await updateUserRank(item.author);

            await createNotification({
              user: item.author,
              sender: userId,
              type: "like",
              post: item._id
            });
      }

      await item.save();
      res.status(200).json({ noOfLikes: item.noOfLikes, isLiked: !hasLiked, pointsChange: hasLiked ? -5 : null });

  } catch (err) {
      res.status(500).json({ message: "Error toggling like", error: err });
  }
};

const itemLikedBy = async (req, res) => {
  const item = await findItemByIdOrSlug(req.params.itemId).populate('likedBy', 'fullName avatar');
  res.json(item.likedBy);
};

const itemCommentsBy = async (req, res) => {
  const item = await findItemByIdOrSlug(req.params.itemId).populate('commentsBy', 'fullName avatar');
  res.json(item.commentsBy);
};

const promotePost = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { duration, totalPoints} = req.body;

    const daysMap = {
      '1d': 1,
      '3d': 3,
      '7d': 7,
      '30d': 30,
    };

    const days = daysMap[duration];
    if (!days) return res.status(400).json({ error: 'Invalid duration' });

    const item = await findItemByIdOrSlug(itemId);
    if (!item) return res.status(404).json({ error: 'Post not found' });

    const now = new Date();
    const endTime = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // await updateUserPoints(item.author, -totalPoints); // trừ điểm
    // await PointsHistory.create({ userId: item.author, points: -totalPoints, description: 'Promote a post in ' + duration });

    post.isPromoted = true;
    post.promoteStart = now;
    post.promoteEnd = endTime;

    await post.save();
    res.json({ message: 'Post promoted', post, pointsChange: -totalPoints });
  } catch (err) {
    res.status(500).json({ message: 'Promote failed', error: err });
  }
};

const checkSlug = async (req, res) => {
  const { slug } = req.params;

  const isValid = /^[a-zA-Z0-9-]+$/.test(slug);
  if (!isValid) {
    return res.status(400).json({ available: false, message: 'Invalid format. Only letters, numbers, and dashes are allowed.' });
  }

  const existing = await Item.findOne({ slug });
  if (existing) {
    return res.json({ available: false, message: 'Slug already taken' });
  }

  res.json({ available: true });
};

module.exports = {increaseViews, toggleLikeItem, itemLikedBy, itemCommentsBy, promotePost, checkSlug};