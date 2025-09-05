const { JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendEmail } = require('../utils/emailService');
const passport = require("passport");
const PointsHistory = require('../models/PointsHistory');
const { updateUserPoints } = require('../utils/points');
const {updateUserRank} = require('../utils/updateUserRank');

const checkAuth = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    // --- Không có access token ở header ---
    if (!authHeader) {
      const hasRefreshCookie = !!(req.cookies && req.cookies.refreshToken);

      if (hasRefreshCookie) {
        // Có refresh token -> client có thể thử refresh (chỉ thử 1 lần phía client)
        return res.status(401).json({
          message: "Missing access token",
          canRefresh: true
        });
      } else {
        // Không có gì -> user chưa login (public)
        return res.status(401).json({
          message: "Unauthorized: No token",
          notLoggedIn: true
        });
      }
    }

    // --- Có header, lấy token ---
    const parts = authHeader.split(" ");
    const accessToken = parts.length === 2 ? parts[1] : null;

    if (!accessToken) {
      const hasRefreshCookie = !!(req.cookies && req.cookies.refreshToken);
      if (hasRefreshCookie) {
        return res.status(401).json({ message: "Missing access token", canRefresh: true });
      } else {
        return res.status(401).json({ message: "Unauthorized: Missing token", notLoggedIn: true });
      }
    }

    // --- Verify accessToken ---
    let decoded;
    try {
      decoded = jwt.verify(accessToken, JWT_SECRET);
    } catch (err) {
      if (err && err.name === "TokenExpiredError") {
        // Access token hết hạn -> client có thể thử refresh
        return res.status(401).json({ message: "Access token expired", canRefresh: true });
      }
      // Token không hợp lệ
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // --- Lấy user (vẫn check password existence như trước) ---
    const user = await User.findById(decoded.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userObj = user.toObject();
    const hasPass = !!userObj.password;
    delete userObj.password;

    return res.status(200).json({ user: { ...userObj, hasPass } });
  } catch (error) {
    console.error("checkAuth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // verify refreshToken
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // check refreshToken trong DB
    const user = await User.findOne({ _id: decoded.id, refreshToken: token });
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // cấp mới accessToken
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired refresh token" });
  }
};


const verifyReferrer = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.trim() === "") {
      return res.status(400).json({ valid: false, message: "Referrer username is required" });
    }

    const user = await User.findOne({ username: username.trim() });

    if (user) {
      return res.json({ valid: true, message: "Referrer exists" });
    } else {
      return res.json({ valid: false, message: "Referrer not found" });
    }
  } catch (err) {
    res.status(500).json({ valid: false, message: err.message });
  }
};

// GET /api/check-email?email=xxx
const checkEmailAvailable = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ available: false, message: "Email required" });

    const exists = await User.exists({ email });
    if (exists) {
      return res.json({ available: false, message: "Email already registered" });
    }

    return res.json({ available: true, message: "Email available" });
  } catch (err) {
    res.status(500).json({ available: false, message: err.message });
  }
};


const registerOrLoginWithOTP = async (req, res) => {
  const { email, avatar, timezone, lang, password } = req.body;

  try {
    let user = await User.findOne({ email });
    let isNewUser = false;
    let bonusPoints = 0;

    if (!user) {
      isNewUser = true;
      const totalUsers = await User.countDocuments();
      if (totalUsers < 10) bonusPoints = 10000;
      else if (totalUsers < 100) bonusPoints = 3000;
      else bonusPoints = 500;

      let baseUsername = email.split("@")[0];
      let finalUsername = baseUsername;
      let counter = 2;

      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }

      let hashedPassword = null;
      if (password && password.trim() !== "") {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      user = new User({
        email,
        username: finalUsername,
        password: hashedPassword || null,
        avatar,
        lang: lang || "en",
        timezone: timezone || "UTC",
        role: totalUsers === 0 ? "admin" : "user",
        userRank: "Rising Talent",
        userPoints: 0,
        joinedDate: new Date(),
        referrer: null,
      });
      await user.save();

      await PointsHistory.create({ userId: user.id, points: bonusPoints, description: "New user bonus" });
      await updateUserPoints(user.id, bonusPoints);
      await updateUserRank(user.id);
    }

    // Tạo token login (cả user cũ và mới)
    const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "15d" });

    // res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "lax" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000 });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      accessToken,
      message: isNewUser ? "User registered & logged in" : "User logged in",
      userInfo: {
        username: user.username,
        email: user.email,
        fullName: user.fullName || null,
        avatar: user.avatar || null,
        timezone: user.timezone,
        lang: user.lang,
        userPoints: user.userPoints,
        _id: user._id,
        role: user.role,
        hasPass: !!user.password,
        referrer: null,
      },
      pointsChange: isNewUser ? bonusPoints : 0
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addReferrer = async (req, res) => {
  try {
    const userId = req.user.id; // lấy từ JWT middleware
    const { referrer } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const now = new Date();
    const joined = new Date(user.joinedDate);
    const diffDays = Math.floor((now - joined) / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return res.status(400).json({ error: "Referrer deadline expired" });
    }

    if (user.referrer) {
      return res.status(400).json({ error: "Referrer already set" });
    }

    const _referrer = await User.findOne({ username: referrer });
    if (!_referrer) {
      return res.status(400).json({ error: "Referrer not found" });
    }

    // Gán referrer cho user
    user.referrer = _referrer.username;
    await user.save();

    // Cộng điểm cho referrer
    const bonus = 500;
    await updateUserPoints(_referrer.id, bonus);
    await PointsHistory.create({ userId: _referrer.id, points: bonus, description: "New user referrer" });

    return res.status(200).json({ message: "Referrer added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const postUserLogin = async (req, res) => {
    const { input, password } = req.body;
    try {
        const user = await User.findOne({ 
          $or: [
            { username: input }, 
            { email: input }
          ]
         });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const accessToken = jwt.sign({ id: user._id}, JWT_SECRET, { expiresIn: '1h' });
        // Tạo Refresh Token (hết hạn sau 7 ngày)
        const refreshToken = jwt.sign(
          { id: user._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "15d" }
        );

        // Lưu token vào HTTP Cookies
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000 });

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({ 
          accessToken,
          message: 'Login successful', 
          userInfo: {
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar || null,
            timezone: user.timezone,
            lang: user.lang,
            userPoints: user.userPoints || 0,
            _id: user._id,
            role: user.role,
            hasPass: !!user.password,
            referrer: user.referrer,
        } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(200).json({ message: "Already logged out" });
    }

    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
};

const postUserForgotPass = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "Email not registered" });
  
      // Tạo mã OTP ngẫu nhiên
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expireTime = Date.now() + 5 * 60 * 1000; // OTP hết hạn sau 5 phút

      // Lưu OTP vào DB
      await Otp.updateOne(
        { email },
        { otp, expiresAt: expireTime },
        { upsert: true }
      );
  
      await sendEmail(email, "Reset Password", null, otp, 'Reset Password Code', 'Use the following OTP to reset password');
      res.status(200).json({ message: "Reset password email sent" });
    } catch (error) {
      res.status(500).json({ error: "Error processing request" });
    }
  }

  const resetPassword = async (req, res) => {
    const { email, tempToken, newPassword } = req.body;

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(400).json({ error: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await Otp.deleteMany({ email }); // Xóa tất cả OTP của user sau khi reset thành công

    res.json({ message: "Password reset successful" });
};

const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Tạo mã OTP ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = Date.now() + 5 * 60 * 1000; // OTP hết hạn sau 5 phút
    // Lưu OTP vào DB
    await Otp.updateOne(
      { email },
      { otp, expiresAt: expireTime },
      { upsert: true }
    );
    await sendEmail(email, "Your Verification Code", null, otp, 'Email Verification Code', 'Use the following OTP to verify your email');
    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await Otp.findOne({ email });

    // Kiểm tra OTP có đúng & còn hạn không
    if (
      !otpRecord ||
      otpRecord.otp.toString() !== otp.toString() ||
      otpRecord.expiresAt < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Xác thực email trong User
    await User.updateOne({ email }, { isVerified: true });

    // Xóa OTP sau khi dùng
    await Otp.deleteOne({ email });

    // Tạo token tạm (tempToken) có hiệu lực trong 15 phút
    const tempToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    res.json({ message: "Email verified!", tempToken });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

const getGoogle = passport.authenticate("google", { scope: ["profile", "email"], accessType: "offline", prompt: "consent" });
const getFacebook = passport.authenticate("facebook", { scope: ["email"] });

const getUsers = async (req, res) => {
  try {
    if (!(req.user && req.user.role === 'admin')) {
      return res.status(403).json({ error: "Forbidden" });
    }
    // chỉ lấy các field cần
    const users = await User.find({}, "name email username avatar noOfPosts noOfComments userPoints noOfFollowers noOfFollowings").lean();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {checkAuth, refreshToken, registerOrLoginWithOTP, postUserLogin, logout, postUserForgotPass, verifyOtp, sendVerificationEmail, getFacebook, getGoogle, resetPassword, getUsers, verifyReferrer, checkEmailAvailable, addReferrer}