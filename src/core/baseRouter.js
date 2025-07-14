const express = require("express");
const baseRouter = express.Router();
const userRouter = require("../modules/user/route");
const fileUploadRouter = require("../modules/fileUpload/route");
const aryafouladRouter = require('../modules/aryafoulad/routes');
const leaveRequestRouter = require("../modules/leaveRequest/route");

// Health check route
baseRouter.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is running", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ مسیرهای API
baseRouter.use("/user", userRouter);
baseRouter.use("/upload", fileUploadRouter);
baseRouter.use('/aryafoulad', aryafouladRouter);
baseRouter.use("/leave-request", leaveRequestRouter);

module.exports = baseRouter;
