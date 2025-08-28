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
    if (!req.cookies) {
      return res.status(401).json({ message: "Unauthorized: No cookies found" });
    }
    const accessToken = req.cookies.accessToken;
  
    if (!accessToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }
  
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password"); // 🟢 Lấy toàn bộ thông tin user (trừ password)
  
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
  
    res.status(200).json({ user: {...user.toObject(), hasPass: !!user.password} });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired" }); // 🟢 Trả về lỗi 401 để frontend gọi refresh-token
    }
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
}
  
};

const refreshToken = (req, res) => {
  try {
    if (!req.cookies) {
      return res.status(401).json({ message: "Unauthorized: No cookies found" });
    }
    const refreshToken = req.cookies.refreshToken; // Lấy refresh token từ cookies}
  
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }
  
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Refresh token expired" });
        }
  
        // Tạo mới access token
        const newAccessToken = jwt.sign(
            { id: decoded.id },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
  
        res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true, sameSite: "strict" });
        res.status(200).json({ message: "Token refreshed" });
    });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired refreshToken" });
  }
  
};

const verifyRefferer = async (req, res) => {
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

const postUserRegister = async (req, res) => {
  const { email, username, avatar, referrer, timezone, lang, password } = req.body;

  try {
    // Kiểm tra username / email
    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(400).json({ error: "Username already exists" });

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ error: "Email already exists" });

    // Password có thể null/empty => chỉ hash nếu có
    let hashedPassword = "";
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const totalUsers = await User.countDocuments();
    const user = new User({
      email,
      username,
      password: hashedPassword || null,
      avatar,
      lang: lang || "en",
      timezone: timezone || "UTC",
      userRank: "Rising Talent",
      noOfPosts: 0,
      noOfFollowers: 0,
      following: [],
      followers: [],
      noOfComments: 0,
      role: totalUsers === 0 ? "admin" : "user"
    });
    await user.save();

    // Bonus points logic
    let bonusPoints = 0;
    if (totalUsers < 10) bonusPoints = 10000;
    else if (totalUsers < 100) bonusPoints = 3000;
    else bonusPoints = 500;

    await PointsHistory.create({ userId: user.id, points: bonusPoints, description: "New user bonus" });

    // Referrer logic
    if (referrer) {
      const bonus = 500;
      const _referrer = await User.findOne({ username: referrer });
      if (!_referrer) {
        return res.status(403).json({ error: "Can't find " + referrer + " in the system!" });
      }
      await updateUserPoints(_referrer.id, bonus);
      await PointsHistory.create({ userId: _referrer.id, points: bonus, description: "New user referrer" });
    }

    await updateUserPoints(user.id, bonusPoints);
    await updateUserRank(user.id);

    // Tự động login luôn sau khi register thành công
    const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });

    res.status(201).json({
      message: "User registered & logged in successfully",
      userInfo: {
        username: user.username,
        email: user.email,
        fullName: user.fullName || null,
        avatar: user.avatar || null,
        timezone: user.timezone,
        lang: user.lang,
        userPoints: user.userPoints || bonusPoints || 0,
        _id: user._id,
        role: user.role,
        hasPass: !!user.password
      },
      pointsChange: bonusPoints
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
          { expiresIn: "7d" }
        );

        // Lưu token vào HTTP Cookies
        res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict" });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });

        res.status(200).json({ message: 'Login successful', userInfo: {
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar || null,
          timezone: user.timezone,
          lang: user.lang,
          userPoints: user.userPoints || 0,
          _id: user._id,
          role: user.role,
          hasPass: !!user.password
        } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
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

    // Kiểm tra email đã có tài khoản chưa
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ error: "Email already exists" });

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

const getGoogleCallback = () => [
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const { user, accessToken, refreshToken } = req.user;

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Strict" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });
    res.redirect(process.env.VITE_FE_URL); // Điều hướng về trang chính
  }
]

const getFacebookCallback = () => [
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    const { user, accessToken, refreshToken } = req.user;

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Strict" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });

    res.redirect(process.env.VITE_FE_URL);
  }
]

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

module.exports = {checkAuth, refreshToken, postUserRegister, postUserLogin, logout, postUserForgotPass, verifyOtp, sendVerificationEmail, getGoogleCallback, getFacebookCallback, getFacebook, getGoogle, resetPassword, getUsers, verifyRefferer}