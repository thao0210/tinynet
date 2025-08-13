const User = require("../models/User");
const {updateItemByIdOrSlug} = require('../utils/itemUtils');

const updateUserPoints = async (userId, points) => {
  try {
    await User.findByIdAndUpdate(userId, { $inc: { userPoints: points } });
  } catch (err) {
    console.error("Error updating user points:", err);
  }
};

const updateItemPoints = async (itemId, points) => {
    try {
        await updateItemByIdOrSlug(itemId, { $inc: { itemPoints: points } });
      } catch (err) {
        console.error("Error updating user points:", err);
      }
}

module.exports = { updateUserPoints, updateItemPoints };
