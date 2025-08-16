const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadR2 = multer();
const checkItemAccess = require('../middleware/checkItemMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');
const { postNewItem, getItemsList, getItem, editItem, toggleLikeItem, deleteItem, itemLikedBy, itemCommentsBy, increaseViews, checkPassword, sendOtp, verifyOtp, searchItems, searchAC, getTopUsers, getTopPosts, getTopCommentsByLikesHandle, nextReset, getMyUnseenWeeklyAward, markAwardAsSeen, getUrlMetadata, upload, uploadDraco, voteItem, getVoteResult, checkSlug } = require('../controllers/itemsController.js');
const {generatePdf, getSignedUrl, deleteS3File, r2Upload, r2Delete} = require('../controllers/commonController');


router.post('/newItem', authMiddleware, postNewItem);
router.get('/items', getItemsList);
router.get('/items/:itemId', optionalAuthMiddleware, checkItemAccess, getItem);
router.post("/items/:itemId/like", authMiddleware, toggleLikeItem);
router.post('/items/:itemId/views', increaseViews);
router.put('/items/:itemId', authMiddleware, editItem);
router.delete('/items/:itemId', deleteItem);
router.post('/generate-pdf', generatePdf);
router.post('/s3-sign', getSignedUrl);
router.post('/s3-deletefile', deleteS3File);
router.post('/r2-upload', uploadR2.single('file'),r2Upload);
router.delete('/r2-delete', r2Delete);

router.get('/items/:itemId/likesBy', itemLikedBy);
router.get('/items/:itemId/commentsBy', itemCommentsBy);
router.get('/search-items', searchItems);
// router.get('/search-my-items', authMiddleware, searchMyItems);
router.get('/search-ac', searchAC);
router.post('/send-otp', sendOtp);
router.post('/items/:itemId/verify-otp', checkItemAccess, verifyOtp);
router.post('/items/:itemId/check-password', checkItemAccess, checkPassword);
router.get('/top-posts', getTopPosts);
router.get('/top-users', getTopUsers);
router.get('/champions/next-reset', nextReset);
router.get('/champions/my-results', authMiddleware, getMyUnseenWeeklyAward);
router.post('/champions/mark-award-seen', authMiddleware, markAwardAsSeen);
router.get('/top-comments', getTopCommentsByLikesHandle);
router.post('/get-metadata', getUrlMetadata);
router.post("/upload-draco", authMiddleware, upload.single("file"), uploadDraco);

router.post('/vote/:itemId', voteItem);
router.get('/vote/:itemId/results', getVoteResult);

router.get('/check-slug/:slug', checkSlug);

module.exports = router;