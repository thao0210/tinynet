const itemCRUD = require('./items/items.crud');
const itemSearch = require('./items/items.search');
const itemAuth = require('./items/items.auth');
const itemStats = require('./items/items.stats');
const itemChampions = require('./items/items.champion');
const itemDraco = require('./items/items.draco');
const itemVote = require('./items/items.vote');
const fetchHtml = require("../utils/fetchHtml");
const { fetchYouTubeMeta } = require("../utils/fetchYoutubeMeta");

const metascraper = require("metascraper")([
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-description')(),
  require('metascraper-url')(),
]);


const getUrlMetadata = async (req, res) => {
  try {
    const { url } = req.body;
    const hostname = new URL(url).hostname;

    // ✅ Case YouTube
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      const ytMeta = await fetchYouTubeMeta(url);
      return res.json({ success: true, metadata: ytMeta });
    }

    // ✅ Các platform khác → dùng metascraper
    const html = await fetchHtml(url);
    const metadata = await metascraper({ html, url });
    const finalUrl = metadata.url || url;
    const host = new URL(finalUrl).hostname;

    let source = null;
    let isVideo = false;
    if (host.includes("tiktok.com")) {
      source = "tiktok";
      if (url.includes("/video/")) isVideo = true;
    } else if (host.includes("facebook.com")) {
      source = "facebook";
      if (url.includes("/videos/") || url.includes("/reel/")) isVideo = true;
    } else if (host.includes("instagram.com")) {
      source = "instagram";
      if (url.includes("/reel/") || url.includes("/p/")) isVideo = true;
    }

    res.json({
      success: true,
      metadata: {
        ...metadata,
        source,
        isVideo,
      },
    });
  } catch (error) {
    console.error("getUrlMetadata error", error.message);
    res
      .status(500)
      .json({ success: false, message: "Error fetching metadata", error });
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