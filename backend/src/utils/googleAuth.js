const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // Model User trong MongoDB
const jwt = require("jsonwebtoken");

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

        if (!user) {
          user = new User({
            email: profile.emails?.[0]?.value || `google-${profile.id}@example.com`,
            username: profile.emails?.[0]?.value.split("@")[0] || `google_${profile.id}`,
            fullName: profile.displayName,
            avatar: profile.photos?.[0]?.value || null,
            isVerified: true,
            timezone: "Asia/Saigon",
            lang: "en-US",
            role: "user",
            userPoints: 0,
          });
          await user.save();
        }

        // Sinh JWT để frontend dùng
        const myAccessToken = jwt.sign({ id: user._id }, "ACCESS_SECRET", { expiresIn: "1h" });
        const myRefreshToken = jwt.sign({ id: user._id }, "REFRESH_SECRET", { expiresIn: "15d" });

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
          userPoints: 0,
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
