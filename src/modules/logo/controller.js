const BaseController = require("../../core/baseController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

class LogoController extends BaseController {
  constructor() {
    super();
    this.ensureLogoDirectory();
  }

  ensureLogoDirectory() {
    const logoDir = path.join(__dirname, "../../../uploads/logo");
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }
  }

  getUploadMiddleware() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const logoDir = path.join(__dirname, "../../../uploads/logo");
        cb(null, logoDir);
      },
      filename: (req, file, cb) => {
        // Always save as logo.png to act as single default logo
        const ext = path.extname(file.originalname).toLowerCase();
        const finalExt = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext) ? ext : ".png";
        cb(null, `logo${finalExt}`);
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

  async uploadLogo(req, res) {
    try {
      if (!req.user || !req.user.userId) {
        return this.response(res, 401, false, "برای آپلود لوگو باید وارد شوید");
      }
      if (!req.file) {
        return this.response(res, 400, false, "هیچ فایلی آپلود نشده است");
      }

      const savedPath = `/uploads/logo/${req.file.filename}`;
      return this.response(res, 201, true, "لوگو با موفقیت آپلود شد", {
        filename: req.file.filename,
        path: savedPath,
        size: req.file.size,
        mimeType: req.file.mimetype
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      return this.response(res, 500, false, "خطا در آپلود لوگو", null, error);
    }
  }

  async downloadLogo(req, res) {
    try {
      // Prefer png name, but if extension differs, find any existing logo.* in folder
      const logoDir = path.join(__dirname, "../../../uploads/logo");
      const candidates = ["logo.png", "logo.jpg", "logo.jpeg", "logo.webp", "logo.gif", "logo.svg"];
      let filePath = null;
      for (const name of candidates) {
        const p = path.join(logoDir, name);
        if (fs.existsSync(p)) { filePath = p; break; }
      }
      if (!filePath) {
        return this.response(res, 404, false, "لوگو یافت نشد");
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
      console.error("Error downloading logo:", error);
      return this.response(res, 500, false, "خطا در دانلود لوگو", null, error);
    }
  }
}

module.exports = new LogoController();


