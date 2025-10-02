const express = require("express");
const router = express.Router();
const LogoController = require("./controller");
const { authenticateUser } = require("../user/auth/middleware");

// آپلود لوگو (یک فایل)
router.post(
  "/upload",
  authenticateUser,
  LogoController.getUploadMiddleware().single("logo"),
  LogoController.uploadLogo
);

// دریافت لوگو جاری
router.get(
  "/download",
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  },
  LogoController.downloadLogo
);

module.exports = router;


