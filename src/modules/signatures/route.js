const express = require("express");
const router = express.Router();
const SignatureController = require("./controller");
const { authenticateUser } = require("../user/auth/middleware");

// آپلود امضا
router.post("/upload", 
  authenticateUser,
  SignatureController.getUploadMiddleware().single("signature"),
  SignatureController.uploadSignature
);

// دانلود امضا
router.get("/download/:filename", 
  (req, res, next) => {
    // تنظیم CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  },
  SignatureController.downloadSignature
);

// حذف امضا
router.delete("/delete/:filename", 
  authenticateUser,
  SignatureController.deleteSignature
);

module.exports = router;
