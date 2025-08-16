const path = require("path");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const User = require('../../models/User');

// Cấu hình lưu file tạm thời
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Kiểm tra và tạo thư mục lưu images
const uploadDracoDir = path.join(__dirname, "../../uploads/dracos/");
if (!fs.existsSync(uploadDracoDir)) {
  fs.mkdirSync(uploadDracoDir, { recursive: true });
}

// Xử lý upload và resize ảnh
const uploadDraco = async (req, res) => {
  try {
    const type = req.query.type || "draco";
    if (type !== 'draco') {
      return res.status(400).json({ error: "Invalid type" });
    }

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const userId = req.user.id; // Lấy userId từ token hoặc request
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Lưu file mới
    const fileName = `${type}-${Date.now()}.webp`;
    const filePath = path.join(uploadDracoDir, fileName);

    // Đọc kích thước ảnh gốc
    const image = sharp(req.file.buffer);
    const metadata = await image.metadata();

    const shouldResize = metadata.width > 1000;

    if (shouldResize) {
      await image
        .resize({ width: 1000, fit: "inside" })
        .webp({ quality: 95 })
        .toFile(filePath);
    } else {
      await image
        .webp({ quality: 95 })
        .toFile(filePath);
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${type}s/${fileName}`;
  
    res.json({ fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {upload, uploadDraco};