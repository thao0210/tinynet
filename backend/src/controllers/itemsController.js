const itemCRUD = require('./items/items.crud');
const itemSearch = require('./items/items.search');
const itemAuth = require('./items/items.auth');
const itemStats = require('./items/items.stats');
const itemChampions = require('./items/items.champion');
const itemDraco = require('./items/items.draco');
const itemVote = require('./items/items.vote');

const axios = require("axios");
const metascraper = require("metascraper")([
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-description')(),
  require('metascraper-url')(),
]);

const getUrlMetadata = async (req, res) => {
  try {
    const { url } = req.body;
    const { data: html } = await axios.get(url);
    const metadata = await metascraper({ html, url });
    const finalUrl = metadata.url || url;
    const hostname = new URL(finalUrl).hostname;
    let source = null;
    let isVideo = false;
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      source = "youtube";
      isVideo = true;
    } else if (hostname.includes("tiktok.com")) {
      source = "tiktok";
      if (url.includes("/video/")) {
        isVideo = true;
      }
    } else if (hostname.includes("facebook.com")) {
      source = "facebook";
      if (url.includes("/videos/") || url.includes("/reel/")) {
        isVideo = true;
      }
    } else if (hostname.includes("instagram")) {
      source = "instagram";
      if (url.includes("/reel/") || url.includes("/p/")) {
        isVideo = true;
      }
    }

    res.json({ success: true, metadata: {
        ...metadata,
        isVideo,
        source,
      }, });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching metadata", error });
  }
};

module.exports = { 
  ...itemCRUD, 
  ...itemSearch, 
  ...itemStats, 
  ...itemAuth,
  ...itemChampions,
  ...itemDraco,
  ...itemVote,
  getUrlMetadata
};