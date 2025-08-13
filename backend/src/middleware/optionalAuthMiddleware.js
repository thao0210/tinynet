const checkToken = require("../utils/tokenHelper");
const User = require("../models/User");

const optionalAuthMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    req.user = null;
    return next();
  }

  const decoded = checkToken(token);
  if (decoded instanceof Error) {
    req.user = null;
    return next();
  }

  req.user = await User.findById(decoded.id).select("username fullName avatar email dob phone password");
  return next();
};

module.exports = optionalAuthMiddleware;