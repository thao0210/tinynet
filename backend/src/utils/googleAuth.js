const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // Model User trong MongoDB
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require('../config');
const PointsHistory = require("../models/PointsHistory");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        let bonusPoints = 0;
        let isNewUser = false;

        if (!user) {
          isNewUser = true;
          const totalUsers = await User.countDocuments();

          if (totalUsers < 10) bonusPoints = 10000;
          else if (totalUsers < 100) bonusPoints = 3000;
          else bonusPoints = 500;
          user = new User({
            email: profile.emails?.[0]?.value || `google-${profile.id}@example.com`,
            username: profile.emails?.[0]?.value.split("@")[0] || `google_${profile.id}`,
            fullName: profile.displayName,
            avatar: profile.photos?.[0]?.value || null,
            isVerified: true,
            timezone: "Asia/Saigon",
            lang: "en-US",
            role: "user",
            userPoints: bonusPoints,
            authProvider: 'google',
            joinedDate: new Date(),
            referrer: null,
          });
          await user.save();
          await PointsHistory.create({ userId: user.id, points: bonusPoints, description: 'New user bonus' });

        }

        // Sinh JWT để frontend dùng
        const myAccessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
        const myRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "15d" });

        user.refreshToken = myRefreshToken;
        await user.save();

        // Gắn token vào user object (passport sẽ lưu)
        const safeUser = {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          accessToken: myAccessToken,
          refreshToken: myRefreshToken,
          timezone: "Asia/Saigon",
          lang: "en-US",
          role: "user",
          userPoints: user.userPoints,
          authProvider: 'google',
          joinedDate: user.joinedDate,
          pointsChange: isNewUser ? bonusPoints : 0,
          hasPass: !!user.password,
          referrer: user.referrer || null,
        };

        return done(null, safeUser);   // ✅ chỉ truyền 2 tham số
      } catch (err) {
        console.error("Error in Google strategy:", err);
        return done(err, null);
      }
    }

  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
