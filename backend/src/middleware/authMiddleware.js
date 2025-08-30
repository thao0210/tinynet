// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const checkToken = require("../utils/tokenHelper");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const decoded = checkToken(token);
  if (decoded instanceof Error) {
    if (decoded.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }

  req.user = await User.findById(decoded.id).select("username fullName avatar email dob phone password role");
  if (!req.user) return res.status(404).json({ message: "User not found" });

  next();
};

module.exports = authMiddleware;
