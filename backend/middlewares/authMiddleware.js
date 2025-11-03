const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ success: false, message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token expired or invalid" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") next();
  else res.status(403).json({ success: false, message: "Access denied: Admins only" });
};

module.exports = { protect, isAdmin };
