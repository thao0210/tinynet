const Comment = require('../models/Comment');
const User = require('../models/User');
const {updateUserRank} = require('../utils/updateUserRank');
const {createNotification} = require('../controllers/notificationController');
const { updateUserPoints } = require('../utils/points');
const PointsHistory = require('../models/PointsHistory');
const {findItemByIdOrSlug, updateItemByIdOrSlug} = require('../utils/itemUtils');
const CommentLike = require('../models/CommentLike');

const postNewComment = async (req, res) => {
    try {
        const { itemId, content, mentionedUserIds } = req.body;
        const userId = req.user._id; // Lấy userId từ request (đảm bảo req.user có dữ liệu)
        
        // Kiểm tra xem item có tồn tại không
        const item = await findItemByIdOrSlug(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });
    
        // Tạo comment mới
        const newComment = new Comment({
          itemId,
          author: req.user._id,
          content
        });
    
        await newComment.save();
        await User.findByIdAndUpdate(item.author, { $inc: { noOfComments: 1 } });
        // Cộng điểm cho chủ bài viết
        const author = await User.findById(item.author);
        if (author._id !== req.user._id) {
          await updateUserPoints(author._id, 10);
          await PointsHistory.create({ userId: author._id, points: 10, description: 'New comment' });
        }
        await updateUserPoints(req.user._id, 5);
        await PointsHistory.create({ userId: req.user._id, points: 5, description: 'Add new comment' });

        // Cập nhật userRank
        await updateUserRank(item.author);
        await updateUserRank(req.user._id);
    
        // Cập nhật số lượng comments trong Item
        await updateItemByIdOrSlug(itemId, { 
          $inc: { noOfComments: 1 },
          $addToSet: { commentsBy: userId } // $addToSet tránh trùng lặp userId 
        });

        await createNotification({
          user: item.author,
          sender: userId,
          type: "comment",
          post: item._id,
          comment: newComment._id,
          mentionedUsers: mentionedUserIds,
        });
    
        res.status(201).json({newComment, pointsChange: 5});
      } catch (err) {
        res.status(500).json({ message: 'Error creating comment', error: err });
      }
}

const getCommentsByItem = async (req, res) => {
    try {
      const { itemId } = req.params;
      const userId = req.user.id;
      // Kiểm tra xem item có tồn tại không
      const item = await findItemByIdOrSlug(itemId);
      if (!item) return res.status(404).json({ message: 'Item not found' });
  
      // Lấy danh sách comments
      const comments = await Comment.find({ itemId })
      .populate("author", "username fullName avatar")
      .sort({ createdAt: -1 });
  
      const commentsWithLikeStatus = comments.map(item => ({
        ...item.toObject(),
        isLiked: item.likedBy.includes(userId),
      }));

      res.status(200).json(commentsWithLikeStatus);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching comments', error: err });
    }
  };
  
  module.exports = { getCommentsByItem };

const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate('author', 'username')
      .lean();

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json(comment);
  } catch (err) {
    console.error('Error fetching comment:', err);
    res.status(500).json({ message: 'Error fetching comment', error: err });
  }
};

// ✅ Edit Comment
const editComment = async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
  
      const comment = await Comment.findByIdAndUpdate(commentId, { content }, { new: true });
  
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
  
      res.status(200).json(comment);
    } catch (err) {
      res.status(500).json({ message: 'Error updating comment', error: err });
    }
  };
  
  // ✅ Delete Comment
  const deleteComment = async (req, res) => {
    try {
      const { commentId } = req.params;
  
      const comment = await Comment.findByIdAndDelete(commentId);
  
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
  
      // Giảm số lượng comment trong Item
      await updateItemByIdOrSlug(comment.itemId, { $inc: { noOfComments: -1 } });
      await User.findByIdAndUpdate(comment.author, { $inc: { noOfComments: -1 } });
      
      await updateUserPoints(comment.author, -5);
      await PointsHistory.create({ userId: req.user._id, points: -7, description: 'Remove comment' });

      // Cập nhật userRank
      await updateUserRank(comment.author);

      await CommentLike.deleteMany({ commentId });
  
      res.status(200).json({ message: 'Comment deleted successfully', pointsChange: -7 });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting comment', error: err });
    }
  };

  const toggleLikeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id; // Lấy userId từ token (Middleware xác thực)

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const hasLiked = comment.likedBy.includes(userId);

        if (hasLiked) {
            // Unlike: Xóa userId khỏi danh sách likedBy
            comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId);
            comment.noOfLikes -= 1;

            await CommentLike.deleteOne({ commentId, userId });
            await updateUserPoints(userId, -3);
            await PointsHistory.create({ userId: userId, points: -5, description: 'Unlike a comment' });
            // Cập nhật userRank
            await updateUserRank(comment.author);
        } else {
            // Like: Thêm userId vào danh sách likedBy
            comment.likedBy.push(userId);
            comment.noOfLikes += 1;

            await CommentLike.updateOne(
              { commentId, userId },
              { $setOnInsert: { createdAt: new Date() } },
              { upsert: true }
            );
            // Cong điểm cho chủ bài viết va nguoi like
            await updateUserPoints(comment.author, 5);
            await PointsHistory.create({ userId: comment.author, points: 5, description: 'A comment is liked' });
            await updateUserPoints(userId, 3);
            await PointsHistory.create({ userId: userId, points: 3, description: 'Like a comment' });
            // Cập nhật userRank
            await updateUserRank(comment.author);
        }

        await comment.save();
        res.status(200).json({ noOfLikes: comment.noOfLikes, isLiked: !hasLiked, pointsChange: hasLiked ? -5 : null });

    } catch (err) {
        res.status(500).json({ message: "Error toggling like", error: err });
    }
};

module.exports = {postNewComment, getCommentsByItem, getCommentById, toggleLikeComment, editComment, deleteComment};