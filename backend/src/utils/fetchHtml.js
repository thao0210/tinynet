const axios = require("axios");

async function fetchHtml(url) {
  const hostname = new URL(url).hostname;

  let headers = {};

  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    // YouTube cần UA Chrome
    headers["User-Agent"] =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/120 Safari/537.36";
  } else if (
    hostname.includes("facebook.com") ||
    hostname.includes("instagram.com") ||
    hostname.includes("tiktok.com")
  ) {
    // FB/IG/TikTok dễ bị chặn, dùng UA Safari iOS
    headers["User-Agent"] =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) " +
      "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 " +
      "Mobile/15E148 Safari/604.1";
  }

  const { data } = await axios.get(url, {
    timeout: 10000,
    headers,
    // không throw khi bị 3xx/4xx
    validateStatus: () => true,
  });

  return data;
}

module.exports = fetchHtml;
