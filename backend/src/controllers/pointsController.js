const User = require('../models/User');
const PointsHistory = require('../models/PointsHistory');
const { updateUserPoints } = require("../utils/points");
const { createNotification } = require('./notificationController');

const updatePointsUser = async (req, res) => {
    try {
      const userId = req.user.id;
      const { points, description } = req.body;
  
      // Kiểm tra người dùng hợp lệ
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      await updateUserPoints(userId, points);
      // Lưu lịch sử
      await PointsHistory.create({ userId, points, description});
  
      res.json({ message: "User points updated", userPoints: user.userPoints });
    } catch (error) {
      res.status(500).json({ message: "Error updating user points", error });
    }
  };

  const getPointsHistory = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Nhận page và limit từ query (mặc định: page = 1, limit = 20)
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
  
      // Tổng số bản ghi
      const totalResults = await PointsHistory.countDocuments({ userId });
  
      // Lấy dữ liệu phân trang
      const history = await PointsHistory.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      const pageCount = Math.ceil(totalResults / limit);
  
      res.json({
        success: true,
        data: history,
        totalResults,
        pageCount,
        page,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message,
      });
    }
  };

const dailyCheckin = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const now = new Date();
        const lastCheckin = user.lastCheckin || new Date(0);
        
        // Kiểm tra nếu đã check-in hôm nay
        if (lastCheckin.toDateString() === now.toDateString()) {
            return res.status(400).json({ message: 'You have received your points today!' });
        }
        
        // Cộng điểm
        const points = 100; // hoặc tính logic streak
        user.userPoints += points;
        user.lastCheckin = now;
        await user.save();
        
        // Lưu lịch sử
        await PointsHistory.create({ userId: user.id, points, description: 'Daily Checkin' });
        
        res.json({ message: `You have received ${points} stars today!`, points: user.points });
    } catch (error) {
        res.status(500).json({ message: 'Error sending daily stars' });
    }
};

const sendPoints = async (req, res) => {
    const { username, amount } = req.body;
    try {
        const sender = await User.findById(req.user.id);
        const recipient = await User.findOne({ username });
        
        if (!recipient || sender.id === recipient.id) {
            return res.status(400).json({ message: 'Invalid recipient!' });
        }
        if (sender.userPoints < 5000 || sender.userPoints < amount) {
            return res.status(400).json({ message: 'You don\'t have enough stars to gift!' });
        }
        
        // Trừ điểm người gửi, cộng điểm người nhận
        sender.userPoints -= amount;
        recipient.userPoints += amount;
        await sender.save();
        await recipient.save();
        
        // 📢 Gửi thông báo cho user được nhận điểm
        await createNotification({
          user: recipient.id,
          sender: sender.id,
          type: "sendPoints",
          points: amount
        });
        // Lưu lịch sử
        await PointsHistory.create({ userId: sender.id, points: -amount, description: 'Send points', senderId: recipient.id });
        await PointsHistory.create({ userId: recipient.id, points: amount, description: 'Receive points', senderId: sender.id });
        
        res.json({ message: `You have sent ${amount} stars to ${recipient.username}!` });
    } catch (error) {
        res.status(500).json({ message: 'Error sending stars' });
    }
}

module.exports = {dailyCheckin, updatePointsUser, sendPoints, getPointsHistory}