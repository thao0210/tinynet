const { JWT_SECRET } = require('../../config');
const Otp = require('../../models/Otp'); // Lưu OTP tạm thời vào DB
const jwt = require('jsonwebtoken');
const { sendEmail, generateOtp } = require('../../utils/emailService');

const checkPassword = async (req, res) => {
  const { itemId, password } = req.body;
  try {
    if (!req.item) return res.status(404).json({ message: 'Item not found' });
    
    if (req.item.password && req.item.password !== password) {
      return res.status(403).json({ 
        message: 'Invalid password',
        requirePassword: true,   // ✅ thêm dòng này
        itemId: req.item._id.toString(), // ✅ thêm nếu FE cần biết lại itemId
      });
    }

    if (req.item.sendOtp) {
      // Nếu yêu cầu OTP, tạo `tempToken` và lưu vào cookies
      const tempToken = jwt.sign({ itemId, step: 'password' }, JWT_SECRET, { expiresIn: '5m' });
      res.cookie('tempToken', tempToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 5 * 60 * 1000,
      });
      return res.json({ requiresOtp: true });
    }

    // Nếu không cần OTP, tạo `itemToken` luôn
    const itemToken = jwt.sign({ itemId }, JWT_SECRET, { expiresIn: '15m' });
    res.cookie('itemToken', itemToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ requiresOtp: false });
  } catch (err) {
    res.status(500).json({ message: 'Error checking password', error: err });
  }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Tạo OTP và lưu vào DB
    const otp = generateOtp();
    const newOtp = new Otp({ email, otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Hết hạn sau 5 phút
    await newOtp.save();
    // Gửi OTP qua email
    await sendEmail(email, 'OTP Code to view the post', null, otp, 'Tiny Net – OTP Code', 'Use the following OTP to access your requested content.');
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
}

const verifyOtp = async (req, res) => {
  const { email, phone, otp } = req.body;

  try {
    const tempToken = req.cookies.tempToken;
    // if (!tempToken) return res.status(401).json({ message: 'No temp token' });
    if (tempToken) {
      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (decoded.step !== 'password') return res.status(400).json({ message: 'Invalid step' });
    }

    if (!req.item) return res.status(404).json({ message: 'Item not found' });

    const otpRecord = await Otp.findOne({
      $or: [{ email }, { phone }],
      otp,
      expiresAt: { $gte: Date.now() } // Kiểm tra thời gian hết hạn
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP hợp lệ -> Xóa OTP sau khi xác minh thành công
    await Otp.deleteOne({ _id: otpRecord._id });

    const itemToken = jwt.sign({ itemId: req.item._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.cookie('itemToken', itemToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000,
    });
    
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
}

module.exports = {checkPassword, sendOtp, verifyOtp};