const Theme = require('../models/Theme');
// const AWS = require('aws-sdk');
const { deleteFromR2 } = require('../utils/deleteFromR2');

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION
// });

// GET /themes
const getThemeList = async (req, res) => {
  const userId = req.user._id;

  try {
    const themes = await Theme.find({
      $or: [
        { userId }, // theme của chính mình
        { privacy: 'public' },
        { privacy: 'shared', shareWith: userId }
      ]
    }).select('_id name color updatedAt coverImage userId')
    .sort({ updatedAt: -1 });

    res.json(themes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get themes' });
  }
};

// POST /themes
const createTheme = async (req, res) => {
  const userId = req.user._id;
  const { name, images, coverImage, color, privacy, shareWith } = req.body;

  try {
    const theme = new Theme({
      userId,
      name,
      images,
      coverImage,
      color,
      privacy: privacy || 'public',
      shareWith: Array.isArray(shareWith) ? shareWith : []
    });

    await theme.save();
    res.status(201).json(theme);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create theme' });
  }
};

const getThemeDetail = async (req, res) => {
  const themeId = req.params.id;
  const userId = req.user._id;

  try {
    const theme = await Theme.findById(themeId);

    if (!theme) return res.status(404).json({ error: 'Theme not found' });

    // Kiểm tra quyền truy cập
    const isOwner = theme.userId.equals(userId);
    const isShared = theme.privacy === 'shared' && theme.shareWith.includes(userId);
    const isPublic = theme.privacy === 'public';

    if (!(isOwner || isShared || isPublic)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(theme);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get theme detail' });
  }
};


// DELETE /themes/:id
const deleteTheme = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    const theme = await Theme.findOne({ _id: id, userId });
    if (!theme) return res.status(404).json({ error: 'Theme not found' });

    // Xoá ảnh từ R2 nếu có
    const deleteOps = theme.images
      .filter(img => img.key)
      .map(img => ({
        key: img.key
      }));

    if (deleteOps.length > 0) {
      await Promise.all(
        deleteOps.map(op =>
          deleteFromR2(op.key)
        )
      );
    }

    await theme.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete theme' });
  }
};

module.exports = {getThemeList, createTheme, deleteTheme, getThemeDetail}