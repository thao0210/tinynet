const {Item, Collection, Story, Drawing, Card, Share, Vote} = require('../../models/Item');
const User = require('../../models/User');
const Comment = require('../../models/Comment');
const {updateUserRank} = require('../../utils/updateUserRank');
const {createNotification} = require('../../controllers/notificationController');
const { prepareItemData } = require("../../utils/itemUtils");
const {updateUserPoints} = require("../../utils/points");
const PointsHistory = require('../../models/PointsHistory');
const {promotePost} = require('../../utils/promoteService');
const {findItemByIdOrSlug} = require('../../utils/itemUtils');
const PostLike = require('../../models/PostLike');
const PostView = require('../../models/PostView');
const mongoose = require('mongoose');
const { deleteFromR2 } = require("../../utils/deleteFromR2");

const postNewItem = async (req, res) => {
    try {
      const { type, privacy, sharedWith, password, passwordHint, sendOtp, title, showOnlyInCollection = false, items = [], backgroundMusic, showTitle, isAnonymous, slug, isFriendlyUrl, restrictedAccess } = req.body;

      const userId = req.user.id;

      let Model;
      switch (type) {
        case "story":
          Model = Story;
          break;
        case "drawing":
          Model = Drawing;
          break;
        case "card":
          Model = Card;
          break;
        case "shareUrl":
          Model = Share;
          break;
        case "collection":
          Model = Collection;
          break;
        case "vote":
          Model = Vote;
          break;
        default:
          return res.status(400).json({ message: "Invalid item type" });
      }

      if (type === "collection") {
        // Tạo collection
        const newCollection = new Collection({ author: userId, items, privacy, type, sharedWith, password, passwordHint, sendOtp, title, showOnlyInCollection, showTitle, restrictedAccess});
        const savedCollection = await newCollection.save();
  
        // Cập nhật tất cả các items con trong collection
        await Item.updateMany(
          { _id: { $in: items } },
          { showOnlyInCollection: showOnlyInCollection }
        );
  
        return res.status(201).json(savedCollection);
      }

      // Gọi hàm xử lý dữ liệu
      const itemData = prepareItemData(type, req.body, userId);
      const newItem = new Model({...itemData, type, author: userId, privacy, sharedWith, password, passwordHint, sendOtp, title,backgroundMusic, showTitle, isAnonymous: !!isAnonymous, slug, isFriendlyUrl, restrictedAccess});
      
      if (newItem.slug === '' || newItem.slug == null) {
        delete newItem.slug;
        newItem.set('slug', undefined, { strict: false }); // Xóa field hoàn toàn
      }
      
      const savedItem = await newItem.save();

      // Cập nhật số lượng bài viết
      await User.findByIdAndUpdate(userId, { $inc: { noOfPosts: 1 } });
      
      // Cộng điểm cho chủ bài viết
      let points = 20;
        if ((type === 'story' && req.body.text.length > 150) || type === 'drawing'){
          points = 50;
        }
        await updateUserPoints(userId, points);
        await PointsHistory.create({ userId: userId, points: points, description: 'New post' });

      // Cập nhật userRank
      await updateUserRank(req.user._id);

      // Gửi thông báo đến followers
      const followers = await User.find({ following: userId }).select("_id");
      for (const follower of followers) {
        await createNotification({
          user: follower._id,
          sender: userId,
          type: "new_post",
          post: newItem._id
        });
      }

      res.status(201).json({savedItem , pointsChange: points});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating item', error: err });
    }
  }

  const getItemsList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      userId,
      sortBy = 'latest',
      type,
      filters = [],
      from,
      to
    } = req.query;

    const skip = (page - 1) * limit;
    const now = new Date();

    const filterArray = typeof filters === 'string' ? filters.split(',') : filters;

    await Item.updateMany(
      {
        isPromoted: true,
        promoteEnd: { $lt: now }
      },
      {
        $set: { isPromoted: false }
      }
    );

    let query = { privacy: 'public' };
    const andQuery = [];

    const isValidDate = (value) => value && !isNaN(new Date(value).getTime());

    if (isValidDate(from) || isValidDate(to)) {
      const dateFilter = {};
      if (isValidDate(from)) dateFilter.$gte = new Date(from);
      if (isValidDate(to)) dateFilter.$lte = new Date(to);
      andQuery.push({ date: dateFilter });
    }

    const authorConditions = [];

    if (filterArray.includes('myPosts') && userId) {
      authorConditions.push({ author: userId });
    }

    if (filterArray.includes('myFollowings') && userId) {
      const user = await User.findById(userId).select('following');
      const followings = user?.following || [];
      if (followings.length > 0) {
        authorConditions.push({ author: { $in: followings } });
      }
    }

    if (filterArray.includes('myFollowers') && userId) {
      const followers = await User.find({ following: userId }).select('_id');
      const followerIds = followers.map(f => f._id);
      if (followerIds.length > 0) {
        authorConditions.push({ author: { $in: followerIds } });
      }
    }

    if (authorConditions.length > 0) {
      andQuery.push({ $or: authorConditions });
    }

    if (type && type !== 'all' && type !== 'undefined') {
      andQuery.push({ type });
    }

    if (filterArray.includes('promoted')) {
      andQuery.push({
        isPromoted: true,
        promoteStart: { $lte: now },
        promoteEnd: { $gte: now }
      });
    }

    if (andQuery.length > 0) {
      query = { ...query, $and: andQuery };
    }

    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;
    if (isValidObjectId(userId)) {
      const viewer = await User.findById(userId).select('hiddenItems hiddenAuthors blockedUsers');

      if (viewer) {
        if (viewer.hiddenItems.length > 0) {
          query._id = query._id
            ? { $and: [query._id, { $nin: viewer.hiddenItems }] }
            : { $nin: viewer.hiddenItems };
        }

        const excludedAuthors = [...viewer.hiddenAuthors, ...viewer.blockedUsers];
        if (excludedAuthors.length > 0) {
          query.author = query.author
            ? { $and: [query.author, { $nin: excludedAuthors }] }
            : { $nin: excludedAuthors };
        }
      }
    }

    const sortOption = {
      latest: { date: -1 },
      oldest: { date: 1 },
      mostViewed: { views: -1 },
      mostCommented: { commentsCount: -1 }
    }[sortBy] || { date: -1 };

    // Convert sortOption to array format for $sort
    const sortArray = Object.entries(sortOption).map(([key, value]) => [key, value]);

    // Aggregation with virtual isCurrentlyPromoted field
    const items = await Item.aggregate([
      { $match: query },
      {
        $addFields: {
          isCurrentlyPromoted: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$isPromoted', true] },
                  { $lte: ['$promoteStart', now] },
                  { $gte: ['$promoteEnd', now] }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      },
      {
        $sort: {
          isCurrentlyPromoted: -1,
          ...sortOption
        }
      },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' }
    ]);

    // Convert to lean-like structure
    const sanitizedItems = items.map(item => {
      if (item.password || item.sendOtp) {
        return {
          ...item,
          content: undefined,
          text: undefined,
          textNoAccent: undefined,
          password: undefined,
          imageUrl: undefined,
          thumbnailImage: undefined,
          items: undefined,
          preview: undefined,
          url: undefined,
          hasPass: !!item.password
        };
      }

      if (item.type === 'card') {
        return {
          ...item,
          cardDetails: undefined
        }
      }
      return item;
    });

    res.status(200).json(sanitizedItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching items', error: err });
  }
};

const getItem = async (req, res) => {
  try {
      const { item, user, accessRequirement } = req;

      if (accessRequirement.loginRequired && !user) {
        return res.status(401).json({
          message: "Login required",
          requireLogin: true,
          requirePassword: accessRequirement.requirePassword,
          requireOtp: accessRequirement.requireOtp,
          itemId: item._id.toString(),
        });
      }

      if (accessRequirement.requirePassword) {
        return res.status(403).json({
          message: "Password required",
          requirePassword: true,
          requireOtp: accessRequirement.requireOtp,
          itemId: item._id.toString(),
        });
      }

      if (accessRequirement.requireOtp) {
        return res.status(403).json({
          requireLogin: true,
          message: "OTP required",
          requireOtp: true,
          itemId: item._id.toString(),
        });
      }

      let items = [];
      // Nếu là collection, load list items
      if (item.type === 'collection' && item.items.length > 0) {
        items = await Item.find({ _id: { $in: item.items } }).populate("author", "username fullName avatar");
      }

      // vote
      if (item.type === 'vote' && item.items.length > 0) {
        const foundItems = await Item.find({ _id: { $in: item.items } })
          .populate("author", "username fullName avatar");
      
        // 3. Merge thêm noOfVotes, votedUsers từ item.itemsView
        items = foundItems.map(foundItem => {
          const extraData = item.itemsView.find(i => i.item.toString() === foundItem._id.toString());
          return {
            ...foundItem.toObject(),
            noOfVotes: extraData?.noOfVotes || 0,
            votedUsers: extraData?.votedUsers || []
          };
        });
      }

      res.status(200).json({
          item,
          items
      });
  } catch (err) {
      console.error('Error fetching item:', err);
      res.status(500).json({ message: 'Error fetching item', error: err });
  }
};

// ✅ Edit Item
const editItem = async (req, res) => {
    try {
      const { itemId } = req.params;
      const updatedData = req.body;
      
      const oldItem = await findItemByIdOrSlug(itemId);

      if (!oldItem) return res.status(404).json({ message: 'Item not found' });

    const deleteFromR2ByUrl = async (url) => {
      if (!url || !url.startsWith(process.env.R2_UPLOAD_URL)) return;
    
      try {
        const key = decodeURIComponent(url.replace(`${process.env.R2_UPLOAD_URL}/`, '').split('?')[0]);
        await deleteFromR2(key);
      } catch (err) {
        console.warn('Failed to delete from R2:', url, err.message);
      }
    };

    if (oldItem.type === 'story') {
      const extractMediaUrls = (html = '') => {
        const urls = [];
        const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)];
        const videoMatches = [...html.matchAll(/<video[^>]+src=["']([^"']+)["']/g)];
    
        imgMatches.forEach(match => urls.push(match[1]));
        videoMatches.forEach(match => urls.push(match[1]));
    
        return urls;
      };
    
      const unescapeContent = (html) => html?.replace(/\\"/g, '"') || '';
      const decodeHTML = (html) => require('he').decode(html);
    
      const oldContent = decodeHTML(unescapeContent(oldItem.content));
      const newContent = decodeHTML(unescapeContent(updatedData.content));
    
      const oldUrls = extractMediaUrls(oldContent);
      const newUrls = extractMediaUrls(newContent);
      const unusedUrls = oldUrls.filter(url => !newUrls.includes(url));
    
      for (const url of unusedUrls) {
        await deleteFromR2ByUrl(url);
      }
    }

    // Với drawingg: xoá imageUrl hoặc savedPaths cũ nếu khác
    if ( oldItem.type === 'drawing') {
      if (oldItem.imageUrl && updatedData.imageUrl && oldItem.imageUrl !== updatedData.imageUrl) {
        await deleteFromR2ByUrl(oldItem.imageUrl);
      }
      if (oldItem.savedPaths && oldItem.savedPaths !== updatedData.savedPaths) {
        await deleteFromR2ByUrl(oldItem.savedPaths);
      }
    }

    if (updatedData.slug === '' || updatedData.slug == null) {
      delete updatedData.slug;
      oldItem.set('slug', undefined, { strict: false }); // Xóa field hoàn toàn
    }

    // Merge updatedData vào item
    Object.assign(oldItem, updatedData);
    const updatedItem = await oldItem.save(); // lúc này mongoose giữ đúng discriminator

    let promoted = false;
    let promoteError = null;

    // ✅ Nếu có yêu cầu promote
    if (updatedData.isPromoted && updatedData.promoteDuration) {
      try {
        await promotePost({
          itemId: updatedItem._id,
          duration: updatedData.promoteDuration,
        });
        promoted = true;
      } catch (err) {
        promoteError = err.message;
      }
    }

    // ✅ Trừ điểm nếu có usePoint
    if (updatedData.usePoint > 0) {
      try {
        await updateUserPoints(req.user._id, -updatedData.usePoint);
        await PointsHistory.create({
          userId: req.user._id,
          points: -updatedData.usePoint,
          description: `Used ${updatedData.usePoint} points on item update`,
        });
      } catch (err) {
        console.warn('Failed to deduct points:', err.message);
      }
    }

    return res.status(200).json({
      item: updatedItem,
      promoted,
      promoteError,
      pointsChange: updatedData.usePoint ? -updatedData.usePoint : 0
    });
      // res.status(200).json(updatedItem);
    } catch (err) {
      res.status(500).json({ message: 'Error updating item', error: err });
    }
  };
  
  // ✅ Delete Item
  const deleteItem = async (req, res) => {
    try {
      const { itemId } = req.params;

      const item = await findItemByIdOrSlug(itemId);
      if (!item) return res.status(404).json({ message: 'Item not found' });

      // Xoá ảnh hoặc video trong story content nếu là R2
      if (item.type === 'story' && item.content) {
        const srcList = [
          ...item.content.matchAll(/<(img|video)[^>]+src="([^">]+)"/g),
        ]
          .map((match) => match[2])
          .filter((src) => src.startsWith(process.env.R2_UPLOAD_URL));

        for (const src of srcList) {
          const key = src.replace(`${process.env.R2_UPLOAD_URL}/`, '');
          try {
            await deleteFromR2(key);
          } catch (err) {
            console.warn(`Failed to delete file from R2: ${key}`, err);
          }
        }
      }

      // Xoá file trên R2 nếu là drawing
      if ((item.type === 'drawing') && item.imageUrl) {
        const key = item.imageUrl.replace(`${process.env.R2_UPLOAD_URL}/`, '');
        try {
          await deleteFromR2(key);
        } catch (err) {
          console.warn(`Failed to delete imageUrl from R2: ${key}`, err);
        }
        if (item.savedPaths) {
          const pathsKey = item.savedPaths.replace(`${process.env.R2_UPLOAD_URL}/`, '');
          try {
            await deleteFromR2(pathsKey);
          } catch (err) {
            console.warn(`Failed to delete paths Url from R2: ${pathsKey}`, err);
          }
        }
      }

      if (item.type === 'card' && item.cardDetails) {
        let cardDetails = item.cardDetails;

        // Xoá music file nếu là custom
        if (cardDetails.music?.file || cardDetails.music?.url?.startsWith(process.env.R2_UPLOAD_URL)) {
          const key = cardDetails.music.url.replace(`${process.env.R2_UPLOAD_URL}/`, '');
          await deleteFromR2(key).catch(err => console.warn('Delete music failed', err));
        }

        // Xoá recorder sounds
        if (Array.isArray(cardDetails.naturalSounds)) {
          for (const sound of cardDetails.naturalSounds) {
            if (sound.type === 'recorder' && sound.url?.startsWith(process.env.R2_UPLOAD_URL)) {
              const key = sound.url.replace(`${process.env.R2_UPLOAD_URL}/`, '');
              await deleteFromR2(key).catch(err => console.warn('Delete recorder failed', err));
            }
          }
        }

        // Xoá background file nếu là video/image user upload
        for (const screen of cardDetails.screens || []) {
          const bg = screen.background;
          if (bg?.file || bg?.url?.startsWith(process.env.R2_UPLOAD_URL)) {
            const key = bg.url.replace(`${process.env.R2_UPLOAD_URL}/`, '');
            await deleteFromR2(key).catch(err => console.warn('Delete background failed', err));
          }
        }

        // Xoá thumbnail nếu có
        if (item.imageThumbnail?.startsWith(process.env.R2_UPLOAD_URL)) {
          const thumbKey = item.imageThumbnail.replace(`${process.env.R2_UPLOAD_URL}/`, '');
          await deleteFromR2(thumbKey).catch(err => console.warn('Delete thumbnail failed', err));
        }
      }

      // Xoá khỏi collection, vote nếu có
      await Item.updateMany(
        {
          type: { $in: ['collection', 'vote'] }
        },
        {
          $pull: {
            items: itemId, // chỉ dùng nếu là mảng ObjectId
            itemsView: { item: itemId } // dùng nếu là mảng object
          }
        }
      );

      // Xoá các phụ liên quan đến item
      await PostLike.deleteMany({ itemId });
      await PostView.deleteMany({ itemId });
    
      const deleteResult = await Item.findByIdAndDelete(itemId);
      if (!deleteResult) {
        console.error("Failed to delete item from database");
        return res.status(500).json({ message: "Failed to delete item from database" });
      }
      // Xoá tất cả comments liên quan
      await Comment.deleteMany({ itemId });
      await User.findByIdAndUpdate(item.author, { $inc: { noOfPosts: -1 } });
      // Trừ điểm cho chủ bài viết
      let points = -20;
      if ((item.type === 'story' && item.text.length > 150) || item.type === 'drawing'){
        points = -50;
      }
      await updateUserPoints(item.author, points);
      await PointsHistory.create({ userId: item.author, points: -20, description: 'Remove a post' });
      // Cập nhật userRank
      await updateUserRank(item.author);
      res.status(200).json({ message: 'Item deleted successfully', pointsChange: points });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting item', error: err });
    }
  };

  module.exports = {postNewItem, getItem, getItemsList, editItem, deleteItem};