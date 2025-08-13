const mongoose = require('mongoose');
const {Item} = require('../models/Item');

const prepareItemData = (type, body) => {
    switch (type) {
      case "story":
        return {
          content: body.content,
          text: body.text,
          voice: body.voice,
          storyCategory: body.storyCategory,
          themeType: body.themeType,
          theme: body.theme,
          themeShape: body.themeShape,
          language: body.language,
          translations: body.translations,
          allowContribution: body.allowContribution
        };
      case "drawing":
        return {
          imageUrl: body.imageUrl,
          savedPaths: body.savedPaths,
          drawingCategory: body.drawingCategory,
          canEdit: body.canEdit,
          hasBg: body.hasBg
        };
      case "card":
        return {
          cardDetails: body.cardDetails,
          thumbnailImage: body.thumbnailImage,
          cardTextContent: body.cardTextContent
        };
      case "shareUrl":
        return {
          url: body.url,
          preview: body.preview,
        };
      case "collection":
        return {
          items: body.items || [],
        };
      case "vote":
        const structuredItems = body.items.map(id => ({
            item: id,
            noOfVotes: 0,
            isVoted: false, // mặc định ban đầu
            }));
        const structureUsers = body.users.map(id => ({
            user: id,
            noOfVotes: 0,
            status: 'pending',
            isVoted: false, // mặc định ban đầu
        }));
        return {
          items: body.items || [],
          users: body.users || [],
          itemsView: structuredItems || [],
          usersView: structureUsers || [],
          customOptions: body.customOptions || [],
          description: body.description,
          deadline: body.deadline,
          timezone: body.timezone,
          voteMode: body.voteMode,
          voteType: body.voteType,
          voteReward: body.voteReward
        }
      default:
        throw new Error("Invalid item type");
    }
  };
  
const findItemByIdOrSlug = (idOrSlug, options = {}) => {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    return Item.findById(idOrSlug, options);
  } else {
    return Item.findOne({ slug: idOrSlug }, options);
  }
};

const updateItemByIdOrSlug = async (idOrSlug, update, options = {}) => {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    return await Item.findByIdAndUpdate(idOrSlug, update, options);
  } else {
    return await Item.findOneAndUpdate({ slug: idOrSlug }, update, options);
  }
};

module.exports = { prepareItemData, findItemByIdOrSlug, updateItemByIdOrSlug};
  