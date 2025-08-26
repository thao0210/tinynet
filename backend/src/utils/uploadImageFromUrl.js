const fetch = require("node-fetch");
const path = require("path");
const crypto = require("crypto");

const uploadImageFromUrlToR2 = async (imageUrl) => {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Fetch image failed: ${res.statusText}`);
  
  const buffer = await res.buffer();
  const contentType = res.headers.get("content-type") || "image/jpeg";

  // Tạo key ngẫu nhiên theo hash để tránh trùng
  const extMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  const ext = extMap[contentType] || ".jpg";
  const key = `meta/${crypto.randomUUID()}${ext}`;

  // Upload trực tiếp
  const workerUploadURL = `${process.env.R2_UPLOAD_URL}/${key}`;
  const r2Res = await fetch(workerUploadURL, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Authorization': 'Bearer ' + process.env.R2_API_TOKEN
    },
    body: buffer
  });

  if (!r2Res.ok) {
    throw new Error(`Upload failed: ${r2Res.status} ${await r2Res.text()}`);
  }

  return `${process.env.R2_UPLOAD_URL}/${key}`;
}

module.exports = uploadImageFromUrlToR2;