const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  key: { type: String }, // dùng để xoá ảnh từ R2
  repeat: {
    type: String,
    enum: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'],
    default: 'no-repeat'
  },
  size: mongoose.Schema.Types.Mixed, // số px hoặc "auto", "cover", "contain"
  position: { type: String, default: 'left top' }
}, { _id: false });

const themeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  images: [imageSchema], // array of images
  coverImage: String,
  color: String,
  privacy: {
    type: String,
    enum: ['public', 'shared', 'onlyMe'],
    default: 'public'
  },
  shareWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Theme', themeSchema);
