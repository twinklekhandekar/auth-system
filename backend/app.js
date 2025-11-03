const express = require('express')
const app = express()
const { errorHandler } = require("./middlewares/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

app.use(express.json())
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

module.exports = app