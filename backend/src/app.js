require('dotenv').config({ path: './.env' });
const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const authRoutes = require('./routes/auth');
const blockRoutes = require('./routes/block');
const profileRoutes = require('./routes/profile');
const itemsRoutes = require('./routes/items');
const commentsRoutes = require(`./routes/comment`);
const notificationRoutes = require('./routes/notifications');
const pointsRoutes = require('./routes/points');
const paypalRoutes = require('./routes/paypal');
const messageRoutes = require('./routes/message');
const reportsRoutes = require('./routes/report');
const contributionsRoutes = require('./routes/contribution');
const mediaRoute = require('./routes/media');

const path = require("path");

const app = express();

require('./cron')();

app.use(cookieParser());
// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://tinynet.net", "https://thaonguyen.net", "https://upload.tinynet.net", "https://www.tinynet.net", "https://www.thaonguyen.net"],
    credentials: true  // Cho phép gửi cookies
}));
// app.use(bodyParser.json());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/', blockRoutes);
app.use('/api/', itemsRoutes);
app.use('/api/', commentsRoutes);
app.use('/api/', notificationRoutes);
app.use('/api/', profileRoutes);
app.use('/api/', pointsRoutes);
app.use('/api/', paypalRoutes);
app.use('/api/', messageRoutes);
app.use('/api/', reportsRoutes);
app.use('/api/', contributionsRoutes);
app.use('/media', mediaRoute);

module.exports = app;
