const itemCRUD = require('./items/items.crud');
const itemSearch = require('./items/items.search');
const itemAuth = require('./items/items.auth');
const itemStats = require('./items/items.stats');
const itemChampions = require('./items/items.champion');
const itemDraco = require('./items/items.draco');
const itemVote = require('./items/items.vote');

const axios = require("axios");
const metascraper = require("metascraper")([
  require("metascraper-image")(),
  require("metascraper-title")(),
  require("metascraper-description")(),
  require("metascraper-url")(),
]);

const getUrlMetadata = async (req, res) => {
  try {
    const { url } = req.body;
    const { data: html } = await axios.get(url);
    const metadata = await metascraper({ html, url });

    res.json({ success: true, metadata });
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