const jwt = require("jsonwebtoken");
const tokenBlaklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  // Use optional chaining in case cookies aren't parsed/present
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Token not provided.",
    });
  }

  try {
    // 1. Move the DB operation INSIDE the try/catch block
    const isTokenBlackListed = await tokenBlaklistModel.findOne({ token });

    if (isTokenBlackListed) {
      return res.status(401).json({
        message: "Token is invalid.",
      });
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user payload to the request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    // If it's a Mongoose/Database error, handle it cleanly instead of hanging
    if (error.name === "MongooseError" || error.message.includes("buffering")) {
      return res.status(503).json({
        message: "Database connection issue. Please try again later.",
      });
    }

    return res.status(401).json({
      message: "Invalid token.",
    });
  }
}

module.exports = { authUser };
