const express = require('express');
const {updateUser, updateAvatar, updatePassword, searchUser, getUserInfo, toggleFollowUser, checkFollowStatus, upload, uploadAvatar, supportMethods } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const {sendContactMail} = require('../controllers/commonController');
const {getThemeList, createTheme, deleteTheme, getThemeDetail} = require('../controllers/themeController');

const router = express.Router();

router.put('/update-avatar', authMiddleware, updateAvatar);
router.put('/update-user',authMiddleware, updateUser);
router.put('/update-password',authMiddleware, updatePassword);
router.put('/update-methods', authMiddleware, supportMethods);
router.get('/search-users', authMiddleware, searchUser);
router.get('/user-info', authMiddleware, getUserInfo);
router.post('/toggle-follow', authMiddleware, toggleFollowUser);
router.get('/check-follow-status/:targetUserId', authMiddleware, checkFollowStatus);
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
router.post('/contact', sendContactMail);
router.get('/themes', authMiddleware, getThemeList);
router.get('/themes/:id', authMiddleware, getThemeDetail);
router.post('/createTheme', authMiddleware, createTheme);
router.delete('/themes/:id', authMiddleware, deleteTheme);

module.exports = router;
