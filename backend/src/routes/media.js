// routes/media.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/*', async (req, res) => {
  const filename = req.params[0];

  // Ghép URL gốc
  const originUrl = `https://file.tinynet.net/${filename}`;

  try {
    const response = await axios.get(originUrl, {
      responseType: 'stream',
    });

    res.set(response.headers); // Giữ content-type, content-length...
    response.data.pipe(res);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(404).send('File not found');
  }
});

module.exports = router;
