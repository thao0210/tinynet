const jwt = require("jsonwebtoken");

const checkToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return error;
  }
};

module.exports = checkToken;
