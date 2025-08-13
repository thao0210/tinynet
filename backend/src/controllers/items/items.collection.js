const {Item} = require('../../models/Item');
const User = require('../../models/User');

const searchMyItems = async (req, res) => {
    try {
      const userId = req.user._id; // Lấy userId từ user đang đăng nhập
      const { search = "", page = 1, limit = 10, itemId } = req.query;
  
      // Tạo query tìm kiếm theo title (nếu có)
      const query = { author: userId };
      if (search) {
        query.title = { $regex: search, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
      }
  
      // Lấy danh sách item
      let items = await Item.find(query)
        .select("title type createdAt description name sendOtp password") // Chỉ lấy các field cần thiết
        .sort({ createdAt: -1 }) // Sắp xếp mới nhất trước
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      if (itemId) {
        items = items.filter(item => !(item._id.equals(itemId) && item.type === 'collection'));
      }
      res.status(200).json({ success: true, items });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error fetching items", error: err.message });
    }
  }

module.exports = {searchMyItems};