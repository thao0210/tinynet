const path = require('path');
const fs = require('fs');

const envPaths = [
  path.resolve(__dirname, '.env.local'),
  path.resolve(__dirname, '.env.production'),
  path.resolve(__dirname, '.env')
];
const envFile = envPaths.find(p => fs.existsSync(p));
// require('dotenv').config({ path: __dirname + '/.env' });
require('dotenv').config({ path: envFile });
const app = require("./src/app");
const mongoose = require("mongoose");
const { PORT, MONGO_URI } = require('./src/config');
require("./src/utils/facebookAuth");
require("./src/utils/googleAuth");

// Kết nối MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error("❌ MongoDB connection error:", err));
