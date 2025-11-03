const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");

// ✅ Validation Schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("User", "Admin").default("User")
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// ✅ Signup
const registerUser = asyncHandler(async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) throw new Error(error.details[0].message);

  const { username, password, role } = req.body;
  const userExists = await User.findOne({ username });
  if (userExists) throw new Error("User already exists");

  const user = await User.create({ username, password, role });
  res.status(201).json({ success: true, message: "User registered successfully" });
});

// ✅ Login
// ✅ Login
const loginUser = asyncHandler(async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);
  
    const { username, password } = req.body;
    const user = await User.findOne({ username });
  
    if (!user || !(await user.matchPassword(password))) throw new Error("Invalid credentials");
  
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
  
    user.refreshToken = refreshToken;
    await user.save();
  
    // Send both cookies and tokens in response
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful",
        role: user.role,
        accessToken,      // 👈 included for Postman visibility
        refreshToken,     // 👈 included for Postman visibility
      });
  });
  

// ✅ Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new Error("No refresh token found");
  
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("Invalid refresh token");
  
    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const newAccessToken = generateAccessToken(user._id, user.role);
  
      res
        .cookie("accessToken", newAccessToken, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        })
        .json({
          success: true,
          message: "Access token refreshed",
          accessToken: newAccessToken, // 👈 return token explicitly
        });
    } catch {
      throw new Error("Refresh token expired or invalid");
    }
  });
  

// ✅ Logout
const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new Error("Not logged in");

  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("Invalid session");

  user.refreshToken = null;
  await user.save();

  res.clearCookie("accessToken").clearCookie("refreshToken")
     .json({ success: true, message: "Logged out successfully" });
});

// ✅ Protected Admin Data
const getData = asyncHandler(async (req, res) => {
  res.json({ success: true, data: "Confidential admin data only" });
});

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser, getData };
