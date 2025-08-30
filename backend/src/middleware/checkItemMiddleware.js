const checkToken = require("../utils/tokenHelper");
const User = require("../models/User");
const { findItemByIdOrSlug } = require('../utils/itemUtils');

const checkItemAccess = async (req, res, next) => {
  const { itemId } = req.params;
  const mode = req.query.mode || "view";

  try {
    // 1. Lấy item
    const item = await findItemByIdOrSlug(itemId).populate("author", "username fullName avatar");
    if (!item) return res.status(404).json({ message: "Item not found" });

    // 2. Gán item vào request để các bước sau dùng
    req.item = item;

    // 3. Xử lý auth từ accessToken (nếu có)
    let user = null;
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = checkToken(token);
        if (!(decoded instanceof Error)) {
          user = await User.findById(decoded.id).select("username fullName avatar email dob phone password");
          req.user = user;
        } else {
          console.warn("Invalid access token:", decoded.message || decoded.name);
        }
      }
    }

    const isOwner = user && user.username === item.author.username;

    // 4. Nếu là edit và là owner thì cho phép luôn
    if (mode === "edit" && isOwner) {
      req.accessRequirement = {
        loginRequired: false,
        requirePassword: false,
        requireOtp: false,
      };
      return next();
    }

    // 5. Xử lý private/share
    if (item.privacy === "private" && !isOwner) {
      return res.status(403).json({ message: "This item is private and only accessible by the owner" });
    }

    if (item.privacy === "share") {
      if (!user || !item.sharedWith.includes(user.username)) {
        return res.status(403).json({ message: "You are not authorized to view this shared item" });
      }
    }

    // 6. Nếu đến đây thì đã được phép xem — cần tiếp tục kiểm tra các lớp bảo mật khác
    const itemToken = req.cookies.itemToken;

    const requirePassword = !!item.password && !itemToken;
    const requireOtp = !!item.sendOtp && !itemToken;
    const loginRequired = (
      (!isOwner && ["private", "share"].includes(item.privacy)) ||
      (!!item.sendOtp) // nếu yêu cầu gửi OTP thì cần login
    );

    req.accessRequirement = {
      loginRequired,
      requirePassword,
      requireOtp,
    };

    return next();
  } catch (err) {
    console.error("checkItemAccess error:", err);
    return res.status(500).json({ message: "Error checking access", error: err.message });
  }
};

module.exports = checkItemAccess;
