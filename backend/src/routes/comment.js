const express = require('express');
const { postNewComment, getCommentsByItem, editComment, deleteComment, toggleLikeComment, getCommentById} = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/newComment', authMiddleware, postNewComment);
router.get('/comments/:itemId', authMiddleware, getCommentsByItem);
router.post('/comments/:commentId/like', authMiddleware, toggleLikeComment);
router.put('/comments/:commentId', editComment);       // ✏️ Edit Comment
router.delete('/comments/:commentId', deleteComment);  // ❌ Delete Comment
router.get('/comment/:commentId', getCommentById);
module.exports = router;