const itemCRUD = require('./items/items.crud');
const itemSearch = require('./items/items.search');
const itemAuth = require('./items/items.auth');
const itemStats = require('./items/items.stats');
const itemChampions = require('./items/items.champion');
const itemDraco = require('./items/items.draco');
const itemVote = require('./items/items.vote');
const fetchHtml = require("../utils/fetchHtml");

const metascraper = require("metascraper")([
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-description')(),
  require('metascraper-url')(),
]);

const getUrlMetadata = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res
        .status(400)
        .json({ success: false, message: "Missing url" });
    }

    const html = await fetchHtml(url);
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
      if (url.includes("/video/")) isVideo = true;
    } else if (hostname.includes("facebook.com")) {
      source = "facebook";
      if (url.includes("/videos/") || url.includes("/reel/") || url.includes('/watch/')) isVideo = true;
    } else if (hostname.includes("instagram.com")) {
      source = "instagram";
      if (url.includes("/reel/") || url.includes("/p/")) isVideo = true;
    }

    res.json({
      success: true,
      metadata: {
        ...metadata,
        isVideo,
        source,
      },
    });
  } catch (error) {
    console.error("getUrlMetadata error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching metadata",
      error: error.message,
    });
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