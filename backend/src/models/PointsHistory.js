const mongoose = require('mongoose');

const PointsHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, default: 0 },
    description: { type: String},
    seen: {type: Boolean, default: false}
  },{
    timestamps: true // ✅ dòng này sẽ tự động thêm createdAt & updatedAt
  });

module.exports = mongoose.model('PointsHistory', PointsHistorySchema);