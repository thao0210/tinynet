const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const {createNotification} = require('../controllers/notificationController');
const pointsController = require('./pointsController');
const avatarController = require('./avatarController');
const { updateUserPoints } = require('../utils/points');
const PointsHistory = require('../models/PointsHistory');

  const getUserInfo = async (req, res) => {
    const {userId} = req.query;
    const currentUserId = req.user.id;
    try {
      if (!userId) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!currentUserId) {
        return res.status(403).json({ message: 'No permission to access the api' });
      }

      let user;
      let userObjectId;

      if (mongoose.Types.ObjectId.isValid(userId)) {
        // userId là ObjectId
        userObjectId = userId;
      } else {
        // userId là username → tìm trong DB
        const userFromUsername = await User.findOne({ username: userId });
        if (!userFromUsername) {
          return res.status(404).json({ message: 'User not found' });
        }
        userObjectId = userFromUsername._id;
      }
      
      if (userObjectId === currentUserId) {
        user = await User.findById(userObjectId).select('-password');
      } else {
        user = await User.findById(userObjectId).select('fullName username userPoints userRank noOfPosts noOfComments noOfFollowers noOfFollowings followers avatar timezone');
      }
      
      // Kiểm tra xem user hiện tại có follow user này không
      const isFollowing = currentUserId ? user.followers.includes(currentUserId) : false;

      let referrerDeadline = null;
        if (user.joinedDate) {
            const joined = new Date(user.joinedDate);
            referrerDeadline = new Date(joined.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

      res.status(200).json({ user, isFollowing, avatarDate: new Date(), referrerDeadline, });

    } catch (error) {
      res.status(500).json({ error: "Error getting profile information" });
    }
  }

  const updateUser = async (req, res) => {
    const { fullName, dob, phone, occupation, timezone, lang, referrer } = req.body;
  
    try {
      const user = req.user;

      user.fullName = fullName || user.fullName;
      user.dob = dob || user.dob;
      user.phone = phone || user.phone;
      user.occupation = occupation || user.occupation;
      user.timezone = timezone || user.timezone;
      user.lang = lang || user.lang;
  
      if (referrer) {
        if (user.referrer) {
          return res.status(400).json({ error: "Referrer already set" });
        }

        const now = new Date();
        const joined = new Date(user.joinedDate);
        const diffDays = Math.floor((now - joined) / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
          return res.status(400).json({ error: "Referrer deadline expired" });
        }

        const _referrer = await User.findOne({ username: referrer });
        if (!_referrer) {
          return res.status(400).json({ error: "Referrer not found" });
        }

        if (_referrer.id === user.id) {
          return res.status(400).json({ error: "You cannot refer yourself" });
        }

        // Set referrer
        user.referrer = _referrer.username;

        // Tặng điểm cho referrer
        const bonus = 500;
        await updateUserPoints(_referrer.id, bonus);
        await PointsHistory.create({
          userId: _referrer.id,
          points: bonus,
          description: "New user referrer",
        });

        // tặng điểm cho người add
        await updateUserPoints(user.id, 100);
        await PointsHistory.create({
          userId: user.id,
          points: 100,
          description: "Add new user referrer",
        });
      }
      await user.save();
      const userObj = user.toObject();
      delete userObj.password;
      res.status(200).json({ message: "Profile updated successfully", user: userObj, pointsChange: 100 });
    } catch (error) {
      res.status(500).json({ error: "Error updating profile" });
    }
  }
  
  const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    try {
      // Nếu user chưa có password (login bằng GG/FB lần đầu)
      if (!req.user.password) {
        req.user.password = await bcrypt.hash(newPassword, 10);
        await req.user.save();

        return res.status(200).json({ 
          message: "Password created successfully (first time set)" 
        });
      }

      // Nếu user đã có password rồi -> bắt buộc kiểm tra oldPassword
      if (!oldPassword) {
        return res.status(400).json({ error: "Old password is required" });
      }

      const isMatch = await bcrypt.compare(oldPassword, req.user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }

      req.user.password = await bcrypt.hash(newPassword, 10);
      await req.user.save();

      res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Error updating password" });
    }
  };


  const supportMethods = async (req, res) => {
    try {
      const userId = req.user.id; // Giả sử đã có middleware auth gán req.user
      const { methods, note } = req.body;
  
      if (
        !Array.isArray(methods) ||
        !methods.every(m => m && typeof m.type === 'string' && typeof m.value === 'string')
      ) {
        return res.status(400).json({ message: 'Invalid methods format' });
      }
  
      const user = await User.findByIdAndUpdate(
        userId,
        { supportMethods: methods, supportNote: note },
        { new: true }
      );
  
      res.json({ message: 'Support methods updated', supportMethods: user.supportMethods, supportNote: user.supportNote });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  const searchUser = async (req, res) => {
    const { query } = req.query;
    const viewerId = req.user?._id;

    try {
      const viewer = viewerId
        ? await User.findById(viewerId).select('blockedUsers')
        : null;

      const blockedBy = viewerId
        ? await User.find({ blockedUsers: viewerId }).select('_id')
        : [];

      const blockedUserIds = new Set([
        ...(viewer?.blockedUsers || []),
        ...blockedBy.map(u => u._id.toString())
      ]);
      
      const users = await User.find({
        $and: [
          {
            $or: [
              { fullName: { $regex: query, $options: "i" } },
              { fullNameNoAccent: { $regex: query, $options: "i" } },
              { username: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } }
            ]
          },
          { _id: { $nin: Array.from(blockedUserIds) } }
        ]
      }).select("_id fullName username avatar");
  
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };

  const toggleFollowUser = async (req, res) => {
    try {
      const { userId } = req.body; // ID của user cần follow/unfollow
      const currentUserId = req.user.id; // ID của user đang thao tác
  
      if (userId === currentUserId) {
        return res.status(400).json({ message: "You cannot follow yourself" });
      }
  
      const userToFollow = await User.findById(userId);
      const currentUser = await User.findById(currentUserId);
  
      if (!userToFollow) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const isFollowing = currentUser.following.includes(userId);
  
      if (isFollowing) {
        // Unfollow: Xóa user khỏi danh sách following
        currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
        currentUser.noOfFollowings -=1;
        userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId);
        userToFollow.noOfFollowers -= 1;

        // Tru điểm cho nguoi bi unfollow
        await updateUserPoints(userId, -20);
        await updateUserPoints(currentUserId, -5);
        await PointsHistory.create({ userId: userId, points: -20, description: 'You are unfollowed' });
        await PointsHistory.create({ userId: currentUserId, points: -7, description: 'Unfollow an user' });
      } else {
        // Follow: Thêm user vào danh sách following
        currentUser.following.push(userId);
        currentUser.noOfFollowings +=1;
        userToFollow.followers.push(currentUserId);
        userToFollow.noOfFollowers += 1;

        // 📢 Gửi thông báo cho user được follow
        await createNotification({
          user: userId,
          sender: currentUserId,
          type: "follow"
        });

        // Cộng điểm cho nguoi duoc follow va nguoi follow
        await updateUserPoints(userId, 20);
        await updateUserPoints(currentUserId, 5);
        await PointsHistory.create({ userId: userId, points: 20, description: 'You are followed' });
        await PointsHistory.create({ userId: currentUserId, points: 5, description: 'Follow an user' });
      }
  
      await currentUser.save();
      await userToFollow.save();
  
      res.json({ 
        message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
        following: currentUser.following,
        isFollowing: !isFollowing,
        pointsChange: isFollowing ? -7 : 5
      });
    } catch (error) {
      res.status(500).json({ message: "Error toggling follow", error });
    }
  };
  
  const checkFollowStatus = async (req, res) => {
    try {
      const { targetUserId } = req.params;
      const loggedInUserId = req.user?.id; // Lấy ID user từ token
  
      if (!loggedInUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      if (loggedInUserId === targetUserId) {
        return res.json({ isFollowing: false }); // Không thể tự follow chính mình
      }
  
      const user = await User.findById(loggedInUserId).select("following");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const isFollowing = user.following.includes(targetUserId);
  
      res.json({ isFollowing });
  
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
module.exports = {updateUser, updatePassword, searchUser, toggleFollowUser, getUserInfo, checkFollowStatus, supportMethods, ...pointsController, ...avatarController}