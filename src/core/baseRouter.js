const express = require("express");
const baseRouter = express.Router();
const userRouter = require("../modules/user/route");
const fileUploadRouter = require("../modules/fileUpload/route");
const aryafouladRouter = require('../modules/aryafoulad/routes');
const leaveRequestRouter = require("../modules/leaveRequest/route");


// ✅ مسیرهای API
baseRouter.use("/user", userRouter);
baseRouter.use("/upload", fileUploadRouter);
baseRouter.use('/aryafoulad', aryafouladRouter);
baseRouter.use("/leave-request", leaveRequestRouter);


module.exports = baseRouter;
