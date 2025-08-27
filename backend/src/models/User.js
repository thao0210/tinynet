const mongoose = require('mongoose');
const removeAccents = require('remove-accents');

const supportMethodSchema = new mongoose.Schema({
  type: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    phone: String,
    fullName: String,
    fullNameNoAccent: String,
    dob: Date,
    occupation: String,
    avatar: String,
    timezone: String,
    lang: String,
    isVIP: { type: Boolean, default: false},
    noOfFollowers: { type: Number, default: 0 },
    noOfPosts: { type: Number, default: 0 }, // Thêm số lượng bài post
    noOfComments: { type: Number, default: 0 },
    noOfFollowings: { type: Number, default: 0 },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    userRank: { type: String, default: 'Rising Talent' },
    userPoints: { type: Number, default: 0 },
    lastCheckin: { type: Date, default: null },
    streakCount: { type: Number, default: 0 },
    supportMethods: {
      type: [supportMethodSchema],
      default: [],
    },
    supportNote: String,
    // freeUsagesLeft: { type: Number, default: 20 },
    freeUsagesDetail: {
      game: Number,
      restrictUser: Number,
      promote: Number,
      saveCanvas: Number,
      downloadSvg: Number,
      theme: Number
    },
    isOnline: { type: Boolean, default: false },
    showOnline: { type: Boolean, default: true },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hiddenItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    hiddenAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    authProvider: { type: String, enum: ["local", "google", "facebook"], default: "local" }
  });
  
  UserSchema.pre('save', function (next) {
    if (this.fullName) this.fullNameNoAccent = removeAccents(this.fullName).toLowerCase();
    next();
  });
module.exports = mongoose.model('User', UserSchema);
