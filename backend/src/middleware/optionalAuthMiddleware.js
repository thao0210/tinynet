const User = require("../models/User");
const checkToken = require("../utils/tokenHelper");

const optionalAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    req.user = null; // guest
    return next();
  }

  const token = authHeader.split(" ")[1];
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
