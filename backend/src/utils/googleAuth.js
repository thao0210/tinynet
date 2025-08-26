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
      console.log("Google callback triggered");
      console.log("Profile data:", profile);
      console.log("Access token:", accessToken);
      console.log("Refresh token:", refreshToken);

      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            email: profile.emails?.[0]?.value || `google-${profile.id}@example.com`,
            username: profile.emails?.[0]?.value.split("@")[0] || `google_${profile.id}`,
            fullName: profile.displayName,
            avatar: profile.photos?.[0]?.value || null,
            isVerified: true,
          });
          await user.save();
        }

        // JWT
        const myAccessToken = jwt.sign({ id: user._id }, "ACCESS_SECRET", { expiresIn: "1h" });
        const myRefreshToken = jwt.sign({ id: user._id }, "REFRESH_SECRET", { expiresIn: "15d" });

        user.refreshToken = myRefreshToken;
        await user.save();

        console.log("Type of done:", typeof done);
        return done(null, { user, accessToken: myAccessToken, refreshToken: myRefreshToken });
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
