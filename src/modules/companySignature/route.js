const express = require("express");
const router = express.Router();
const CompanySignatureController = require("./controller");
const { authenticateUser } = require("../user/auth/middleware");

// آپلود امضای شرکت (یک فایل)
router.post(
  "/upload",
  authenticateUser,
  CompanySignatureController.getUploadMiddleware().single("signature"),
  CompanySignatureController.uploadSignature
);

// دریافت امضای شرکت جاری
router.get(
  "/download",
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  },
  CompanySignatureController.downloadSignature
);

module.exports = router;
