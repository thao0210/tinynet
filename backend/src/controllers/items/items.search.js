const removeAccents = require('remove-accents');
const {Item} = require('../../models/Item');
const User = require('../../models/User');

const searchItems = async (req, res) => {
    const { keyword = '', page = 1, limit = 12, userId, itemId } = req.query;
  
    try {
      const viewer = userId
        ? await User.findById(userId).select('blockedUsers')
        : null;

      const blockedBy = userId
        ? await User.find({ blockedUsers: userId }).select('_id')
        : [];

      const excludedUserIds = new Set([
        ...(viewer?.blockedUsers || []),
        ...blockedBy.map(u => u._id.toString())
      ]);
      
      let results;
  
      // Pagination
      const skip = (page - 1) * limit;
  
      const normalizedKeyword = removeAccents(keyword).toLowerCase();
      const users = await User.find({
        $or: [
          {username: { $regex: normalizedKeyword, $options: "i" }},
          {fullNameNoAccent: { $regex: normalizedKeyword, $options: "i" } }
        ],
        _id: { $nin: Array.from(excludedUserIds) }
      },
        "_id"
      );

      const userIds = users.map(user => user._id);
      // Nếu không tìm thấy user nào phù hợp (do đều bị block) và keyword có thể là username
      if (userIds.length === 0 && normalizedKeyword) {
        const blockedUserMatches = await User.exists({
          _id: { $in: Array.from(excludedUserIds) },
          $or: [
            { username: { $regex: normalizedKeyword, $options: 'i' } },
            { fullNameNoAccent: { $regex: normalizedKeyword, $options: 'i' } }
          ]
        });

        if (blockedUserMatches) {
          return res.status(200).json({
            results: [],
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalResults: 0,
            pageCount: 0
          });
        }
      }
      const keywordOrConditions = [
        { titleNoAccent: { $regex: normalizedKeyword, $options: 'i' } },
        { textNoAccent: { $regex: normalizedKeyword, $options: 'i' } },
        { translations: { $elemMatch: { title: { $regex: keyword, $options: 'i' } } } },
        { translations: { $elemMatch: { text: { $regex: keyword, $options: 'i' } } } },
        { translations: { $elemMatch: { titleNoAccent: { $regex: normalizedKeyword, $options: 'i' } } } },
        { translations: { $elemMatch: { textNoAccent: { $regex: normalizedKeyword, $options: 'i' } } } }
      ];
      
      if (userIds.length > 0) {
          keywordOrConditions.push({ author: { $in: userIds } });
       }

       const keywordCondition = {
          $or: keywordOrConditions
        };
      // Điều kiện truy cập theo privacy
      let privacyCondition;
      if (userId) {
        privacyCondition = {
          $or: [
            { privacy: 'public' },
            { privacy: 'private', author: userId },
            { privacy: 'share', shareWith: userId }
          ]
        };
      } else {
        privacyCondition = { privacy: 'public' };
      }

        const finalFilter = {
          $and: [
            keywordCondition,
            privacyCondition,
            { author: { $nin: Array.from(excludedUserIds) } }
          ]
        };
        // Search posts by title or content or author
        results = await Item.find(finalFilter)
          .populate("author", "username fullName avatar")
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit);
          // .select('title author contentType shortContent noOfComments noOfLikes')
          // .populate('author', 'username');
  
        if (itemId) {
          results = results.filter(item => !(item._id.equals(itemId) && (['collection', 'vote'].includes(item.type))));
        }
      // Xử lý dữ liệu
      const sanitizedItems = results.map(item => {
        const obj = item.toObject(); 
        if (obj.password || obj.sendOtp) {
          delete obj.content;
          delete obj.text;
          delete obj.textNoAccent;
          delete obj.password;
        }
        return obj;
      });
  
      const totalResults = await Item.countDocuments(finalFilter);
      res.status(200).json({
        results: sanitizedItems,
        page: parseInt(page),
        limit: parseInt(limit),
        total: sanitizedItems.length,
        totalResults,
        pageCount: Math.ceil(totalResults / limit)
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to search' });
    }
  }
  
  const searchAC = async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);
    const viewerId = req.user?._id;
    try {

      const viewer = viewerId
        ? await User.findById(viewerId).select('blockedUsers')
        : null;

      const blockedBy = viewerId
        ? await User.find({ blockedUsers: viewerId }).select('_id')
        : [];

      const excludedUserIds = new Set([
        ...(viewer?.blockedUsers || []),
        ...blockedBy.map(u => u._id.toString())
      ]);

      // Tìm trong title và content của bài viết
      const postResults = await Item.find(
        {
          $and: [
            {
              $or: [
                { title: new RegExp(query, 'i') },
                { text: new RegExp(query, 'i') },
                { titleNoAccent: new RegExp(removeAccents(query), 'i') },
                { textNoAccent: new RegExp(removeAccents(query), 'i') },
                { translations: { $elemMatch: { title: new RegExp(query, 'i') } } },
                { translations: { $elemMatch: { text: new RegExp(query, 'i') } } },
                { translations: { $elemMatch: { titleNoAccent: new RegExp(removeAccents(query), 'i') } } },
                { translations: { $elemMatch: { textNoAccent: new RegExp(removeAccents(query), 'i') } } }
              ]
            },
            { author: { $nin: Array.from(excludedUserIds) } }
          ]
        },
        {
          title: 1,
          text: 1,
          titleNoAccent: 1,
          textNoAccent: 1,
          translations: 1
        }
      ).limit(5);
  
      // Tìm trong username và fullName của user
      const userResults = await User.find(
      {
        $and: [
          {
            $or: [
              { username: new RegExp(query, 'i') },
              { fullName: new RegExp(query, 'i') },
              { fullNameNoAccent: new RegExp(query, 'i') }
            ]
          },
          { _id: { $nin: Array.from(excludedUserIds) } }
        ]
      },
      { username: 1, fullName: 1, fullNameNoAccent: 1 }
    ).limit(5);
  
      // Trích xuất từ/cụm từ chứa từ khóa
      const matchedPhrases = new Set();
  
      // Hàm tìm cụm từ nguyên vẹn chứa query
      const extractPhrases = (text, query) => {
        const regex = new RegExp(`\\b\\w*${query}\\w*\\b`, "gi"); // Tìm từ chứa query
        let match;
        while ((match = regex.exec(text)) !== null) {
          matchedPhrases.add(match[0]); // Lấy từ hoặc cụm từ nguyên vẹn
        }
      };
  
      // Xử lý bài viết
      postResults.forEach(post => {
        extractPhrases(post.title, query);
        extractPhrases(post.text, query);
        if (Array.isArray(post.translations)) {
          post.translations.forEach(t => {
            extractPhrases(t.title || "", query);
            extractPhrases(t.text || "", query);
          });
        }
      });
  
      // Xử lý user
      userResults.forEach(user => {
        extractPhrases(user.username, query);
        extractPhrases(user.fullName, query);
      });
  
      res.json([...matchedPhrases]); // Trả về danh sách từ/cụm từ
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching search results.' });
    }
  };

  module.exports = {searchItems, searchAC};