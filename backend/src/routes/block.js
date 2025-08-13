const express = require('express');

const auth = require('../middleware/authMiddleware');
const {blockUser, unblockUser, getBlockedUsers, hideItem, hideAuthorPosts, getHiddenAuthors, getHiddenItems, unhideAuthorPosts, unhideItem} = require('../controllers/blockController');
const router = express.Router();

router.post('/users/block/:id', auth, blockUser);
router.post('/users/unblock/:id', auth, unblockUser);
router.get('/users/blocked', auth, getBlockedUsers);
router.post('/items/hide/:itemId', auth, hideItem);
router.post('/users/hide-posts/:authorId', auth, hideAuthorPosts);
router.get('/users/hidden-items', auth, getHiddenItems);
router.get('/users/hidden-authors', auth, getHiddenAuthors);
router.post('/items/unhide/:itemId', auth, unhideItem);
router.post('/users/unhide-posts/:authorId', auth, unhideAuthorPosts);

module.exports = router;