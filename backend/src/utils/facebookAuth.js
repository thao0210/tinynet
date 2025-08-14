const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails ? profile.emails[0].value : null });

        if (!user) {
          user = new User({
            email: profile.emails ? profile.emails[0].value : `fb-${profile.id}@facebook.com`,
            username: `fb_${profile.id}`, // Tạo username từ Facebook ID
            fullName: `${profile.name.givenName} ${profile.name.familyName}`, // Lưu fullName từ Facebook
            isVerified: true,
          });
          await user.save();
        }

        const accessToken = jwt.sign({ id: user._id }, "ACCESS_SECRET", { expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: user._id }, "REFRESH_SECRET", { expiresIn: "15d" });

        user.refreshToken = refreshToken;
        await user.save();

        return done(null, { user, accessToken, refreshToken });
      } catch (err) {
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
