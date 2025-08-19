const axios = require("axios");

function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.split("/")[1];
    }
    if (u.searchParams.get("v")) {
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchYouTubeMeta(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  try {
    const { data } = await axios.get(oembedUrl, { timeout: 5000 });
    return {
      title: data.title,
      description: null,
      image: data.thumbnail_url,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      isVideo: true,
      source: "youtube",
    };
  } catch (err) {
    // fallback: chỉ lấy thumbnail mặc định
    return {
      title: null,
      description: null,
      image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      isVideo: true,
      source: "youtube",
    };
  }
}

module.exports = { fetchYouTubeMeta, extractYouTubeId };
