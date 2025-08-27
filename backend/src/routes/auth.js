const express = require('express');
const {checkAuth, refreshToken, postUserLogin, logout, postUserRegister, postUserForgotPass, sendVerificationEmail, verifyOtp, getFacebook, getGoogle, getGoogleCallback, getFacebookCallback, resetPassword} = require('../controllers/authController');
const router = express.Router();
const passport = require("passport");

router.get("/check-auth", checkAuth);
router.post("/refresh-token", refreshToken);
router.post('/register', postUserRegister);
router.post('/login', postUserLogin);
router.post("/logout", logout);
router.post("/forgot-password", postUserForgotPass);
router.post('/reset-password', resetPassword);
router.post('/send-verification-email', sendVerificationEmail);
router.post('/verify-otp', verifyOtp);
router.get("/facebook", getFacebook);
router.get('/google', getGoogle);
router.get("/facebook/callback", getFacebookCallback);
// router.get('/google/callback', getGoogleCallback);
router.get('/google/callback', passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      console.error("Google callback: req.user undefined");
      return res.status(401).send("User not found");
    }
    const { accessToken, refreshToken, pointsChange, authProvider } = req.user;

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Strict" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });

    res.redirect(`${process.env.VITE_FE_URL}/auth-success?provider=${authProvider}&pointsChange=${pointsChange}`);
  });

module.exports = router;
