const axios = require("axios");

async function fetchHtml(url) {
  const host = new URL(url).hostname;

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  if (host.includes("facebook.com") || host.includes("fbcdn.net")) {
    headers["Referer"] = "https://www.facebook.com/";
  } else if (host.includes("instagram.com") || host.includes("cdninstagram.com")) {
    headers["Referer"] = "https://www.instagram.com/";
  }

  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers,
      maxRedirects: 5, // để xem FB có redirect không
      validateStatus: () => true, // cho phép log mọi status (200, 403, 500...)
    });
    return data;
  } catch (err) {
    console.error("❌ fetchHtml error:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status, err.response.statusText);
      console.error("Headers:", err.response.headers);
      console.error(
        "Body preview:",
        typeof err.response.data === "string"
          ? err.response.data.slice(0, 500)
          : err.response.data
      );
    }
    throw err;
  }
}

module.exports = fetchHtml;

