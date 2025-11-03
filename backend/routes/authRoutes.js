const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getData
} = require("../controllers/authController");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/getdata", protect, isAdmin, getData);

module.exports = router;
