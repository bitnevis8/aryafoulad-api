const BaseController = require("../../core/baseController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

class CompanySignatureController extends BaseController {
  constructor() {
    super();
    this.ensureUploadDir();
  }

  ensureUploadDir() {
    const uploadDir = path.join(__dirname, "../../../uploads/signatures");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  getUploadMiddleware() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../../uploads/signatures");
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Always save as company-sign.png (overwrite existing)
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `company-sign${ext}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("فقط فایل‌های تصویری مجاز هستند"), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }
    });
  }

  async uploadSignature(req, res) {
    try {
      if (!req.user || !req.user.userId) {
        return this.response(res, 401, false, "برای آپلود امضا باید وارد شوید");
      }
      if (!req.file) {
        return this.response(res, 400, false, "هیچ فایلی آپلود نشده است");
      }

      const savedPath = `/uploads/signatures/${req.file.filename}`;
      return this.response(res, 201, true, "امضای شرکت با موفقیت آپلود شد", {
        filename: req.file.filename,
        path: savedPath,
        size: req.file.size,
        mimeType: req.file.mimetype
      });
    } catch (error) {
      console.error("Error uploading company signature:", error);
      return this.response(res, 500, false, "خطا در آپلود امضا", null, error);
    }
  }

  async downloadSignature(req, res) {
    try {
      // Look for company-sign with various extensions
      const signatureDir = path.join(__dirname, "../../../uploads/signatures");
      const candidates = ["company-sign.png", "company-sign.jpg", "company-sign.jpeg", "company-sign.webp", "company-sign.gif", "company-sign.svg"];
      let filePath = null;
      for (const name of candidates) {
        const p = path.join(signatureDir, name);
        if (fs.existsSync(p)) { filePath = p; break; }
      }
      if (!filePath) {
        return this.response(res, 404, false, "امضای شرکت یافت نشد");
      }

      const ext = path.extname(filePath).toLowerCase();
      let contentType = "image/png";
      if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".webp") contentType = "image/webp";
      else if (ext === ".svg") contentType = "image/svg+xml";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.sendFile(filePath);
    } catch (error) {
      console.error("Error downloading company signature:", error);
      return this.response(res, 500, false, "خطا در دانلود امضای شرکت", null, error);
    }
  }
}

module.exports = new CompanySignatureController();
