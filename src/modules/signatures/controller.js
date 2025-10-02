const BaseController = require("../../core/baseController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

class SignatureController extends BaseController {
  constructor() {
    super();
    this.initializeDirectories();
  }

  // ایجاد پوشه‌های مورد نیاز
  initializeDirectories() {
    const signaturesDir = path.join(__dirname, "../../../uploads/signatures");
    if (!fs.existsSync(signaturesDir)) {
      fs.mkdirSync(signaturesDir, { recursive: true });
    }
  }

  // تنظیمات multer برای آپلود امضا
  getUploadMiddleware() {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const signaturesDir = path.join(__dirname, "../../../uploads/signatures");
        cb(null, signaturesDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `signature_${Date.now()}_${uniqueSuffix}${ext}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      // فقط فایل‌های تصویری مجاز هستند
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
      }
    };

    return multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
      }
    });
  }

  // آپلود امضا
  async uploadSignature(req, res) {
    try {
      if (!req.file) {
        return this.response(res, 400, false, "هیچ فایلی آپلود نشده است");
      }

      if (!req.user || !req.user.userId) {
        return this.response(res, 401, false, "برای آپلود امضا باید وارد حساب کاربری خود شوید");
      }

      const signaturePath = `/uploads/signatures/${req.file.filename}`;
      
      console.log("✅ Signature uploaded successfully:", req.file.filename);
      return this.response(res, 201, true, "امضا با موفقیت آپلود شد", {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: signaturePath,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadDate: new Date()
      });

    } catch (error) {
      console.error("❌ Error uploading signature:", error);
      return this.response(res, 500, false, "خطا در آپلود امضا", null, error);
    }
  }

  // دانلود امضا
  async downloadSignature(req, res) {
    try {
      const { filename } = req.params;
      const signaturePath = path.join(__dirname, "../../../uploads/signatures", filename);

      // بررسی وجود فایل
      if (!fs.existsSync(signaturePath)) {
        return this.response(res, 404, false, "فایل امضا یافت نشد");
      }

      // تشخیص نوع فایل بر اساس پسوند
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/jpeg'; // پیش‌فرض
      
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.svg') contentType = 'image/svg+xml';

      // تنظیم headers مناسب برای تصاویر
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // کش برای 1 سال
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

      // ارسال فایل
      res.sendFile(signaturePath);

    } catch (error) {
      console.error("❌ Error downloading signature:", error);
      return this.response(res, 500, false, "خطا در دانلود امضا", null, error);
    }
  }

  // حذف امضا
  async deleteSignature(req, res) {
    try {
      const { filename } = req.params;
      const signaturePath = path.join(__dirname, "../../../uploads/signatures", filename);

      // بررسی وجود فایل
      if (!fs.existsSync(signaturePath)) {
        return this.response(res, 404, false, "فایل امضا یافت نشد");
      }

      // حذف فایل
      fs.unlinkSync(signaturePath);

      console.log("✅ Signature deleted successfully:", filename);
      return this.response(res, 200, true, "امضا با موفقیت حذف شد");

    } catch (error) {
      console.error("❌ Error deleting signature:", error);
      return this.response(res, 500, false, "خطا در حذف امضا", null, error);
    }
  }
}

module.exports = new SignatureController();
