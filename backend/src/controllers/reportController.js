// controllers/adminController.js
const Report = require('../models/Report');
const {findItemByIdOrSlug} = require('../utils/itemUtils');
const Comment = require('../models/Comment');
const User = require('../models/User');

const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update user roles.' });
  }

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  res.status(200).json({ message: `User role updated to ${role}`, user });
};

const reportItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { reason } = req.body;

    const item = await findItemByIdOrSlug(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    await Report.create({
      targetType: 'item',
      targetId: item._id,
      reason,
      reportedBy: req.user._id
    });

    res.status(200).json({ message: 'Item reported successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error reporting item', error: err });
  }
};

  // ✅ Report Comment
const reportComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await Report.create({
      targetType: 'comment',
      targetId: comment._id,
      reason,
      reportedBy: req.user._id
    });

    res.status(200).json({ message: 'Comment reported successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error reporting comment', error: err });
  }
};
const updateReportStatus = async (req, res) => {
  const { reportId } = req.params;
  const { status, note } = req.body;

  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    report.note = note || '';
    report.reviewedBy = req.user._id;
    await report.save();

    // (Optional) Gửi thông báo cho người đã report
    // await notifyReporter(report.reportedBy, `Your report has been ${status}`);

    res.status(200).json({ message: 'Report updated successfully', report });
  } catch (err) {
    res.status(500).json({ message: 'Error updating report', error: err });
  }
};

const getReports = async (req, res) => {
  try {
    const { status, targetType } = req.query;
    const query = {};

    if (req.user.role !== 'admin') {
      // user thường chỉ xem report của chính họ
      query.reportedBy = req.user._id;
    }

    // Các filter này luôn áp dụng nếu có, không phân biệt admin hay không
    if (status) query.status = status;
    if (targetType) query.targetType = targetType;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'username')
      .populate('reviewedBy', 'username');

    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reports', error: err });
  }
};


module.exports = {updateReportStatus, getReports, reportItem, reportComment, updateUserRole};