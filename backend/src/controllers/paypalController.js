const axios = require('axios');
const PAYPAL_API = process.env.PAYPAL_API;
const { updateUserPoints } = require('../utils/points');
const PointsHistory = require('../models/PointsHistory');
const { getPackageById } = require('../utils/pointsPricing');

const auth = async () => {
  const res = await axios({
    url: `${PAYPAL_API}/v1/oauth2/token`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET
    },
    data: 'grant_type=client_credentials'
  });
  return res.data.access_token;
};

// Tạo order thanh toán
exports.createOrder = async (req, res) => {
  const accessToken = await auth();
  const { packageId, userId } = req.body;

  const pkg = getPackageById(packageId);
  if (!pkg) return res.status(400).json({ error: 'Invalid package selected' });

  const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: pkg.price.toFixed(2)
      },
      custom_id: `${userId}|${packageId}`  // Gắn cả userId và packageId vào để truy được lúc capture
    }]
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    }
  });

  res.json(response.data);
};

// Capture payment (sau khi user thanh toán xong)
exports.captureOrder = async (req, res) => {
  const { orderId } = req.params;
  const accessToken = await auth();

  const response = await axios.post(
    `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const customData = response.data.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;

  if (!customData || !customData.includes('|')) {
    console.warn('⚠️ custom_id not found or invalid:', customData);
    return res.status(400).json({ error: 'Missing or invalid custom_id in PayPal response' });
  }

  const [userId, packageId] = customData.split('|');
  const pkg = getPackageById(packageId);

  if (!pkg) return res.status(400).json({ error: 'Invalid package at capture' });

  await updateUserPoints(userId, pkg.points);
  await PointsHistory.create({
    userId,
    points: pkg.points,
    description: `Buy ${pkg.points} stars with $${pkg.price}`
  });

  res.json({ success: true, points: pkg.points, pointsChange: pkg.points});
};
