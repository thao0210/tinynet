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
