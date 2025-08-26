const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // Model User trong MongoDB
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // URL callback sau khi đăng nhập thành công
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google callback triggered");
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            username: profile.emails[0].value.split("@")[0], // Tạo username từ email,
            fullName: profile.displayName,
            avatar: profile.photos[0].value,
            isVerified: true, // Vì đăng nhập qua Google
          });
          await user.save();
        }

        // Tạo accessToken và refreshToken
        const accessToken = jwt.sign({ id: user._id }, "ACCESS_SECRET", { expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: user._id }, "REFRESH_SECRET", { expiresIn: "15d" });

        // Lưu refreshToken vào DB (hoặc Redis)
        user.refreshToken = refreshToken;
        await user.save();

        return done(null, { user, accessToken, refreshToken });
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
