const User = require("../models/User");

const updateUserRank = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;
  
    let newRank;
    if (user.userPoints >= 50000) newRank = "Celestial Legend";
    else if (user.userPoints >= 20000) newRank = "Genre Bender";
    else if (user.userPoints >= 10000) newRank = "Master Performer";
    else if (user.userPoints >= 5000) newRank = "Stage Virtuoso";
    else if (user.userPoints >= 1000) newRank = "Indie Dreamer";
    else newRank = "Rising Talent";
  
    if (user.userRank !== newRank) {
      user.userRank = newRank;
      await user.save();
    }
  };
  
  module.exports = {updateUserRank};
  