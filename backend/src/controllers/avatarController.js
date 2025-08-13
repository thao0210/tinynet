const path = require("path");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const User = require('../models/User');

// Cấu hình lưu file tạm thời
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Kiểm tra và tạo thư mục lưu avatars
const uploadDir = path.join(__dirname, "../uploads/avatars/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Xử lý upload và resize ảnh
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const userId = req.user.id; // Lấy userId từ token hoặc request
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Xóa avatar cũ nếu tồn tại
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
          fs.unlink(oldAvatarPath, (err) => {
              if (err) console.error("Error deleting old avatar:", err);
          });
      }
  }

    // Lưu avatar mới
    const fileName = `avatar-${Date.now()}.webp`;
    const filePath = path.join(uploadDir, fileName);

    // Resize và optimize ảnh
    await sharp(req.file.buffer)
      .resize({ height: 300, fit: "inside" })
      .webp({ quality: 80 }) // Điều chỉnh chất lượng để giảm dung lượng
      .toFile(filePath);

    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${fileName}`;
  
    res.json({ avatarUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAvatar = async (req, res) => {
    const { avatar } = req.body;
  
    try {
      req.user.avatar = avatar || req.user.avatar;
  
      // Xóa avatar cũ nếu tồn tại
    // if (req.user.avatar) {
    //   const oldAvatarPath = path.join(__dirname, "..", "uploads", "avatars", path.basename(req.user.avatar));
    //   if (fs.existsSync(oldAvatarPath)) {
    //       fs.unlink(oldAvatarPath, (err) => {
    //           if (err) console.error("Error deleting old avatar:", err);
    //       });
    //   }
    // }
      await req.user.save();

      // await Item.updateMany(
      //   { "author.username": req.user.username }, // Điều kiện: bài viết của user
      //   { $set: { "author.avatar": avatar } } // Cập nhật avatar mới
      // );

      res.status(200).json({ message: "Avatar updated successfully", user: req.user });
    } catch (error) {
      res.status(500).json({ error: "Error updating avatar" });
    }
  }

module.exports = { upload, uploadAvatar, updateAvatar };
