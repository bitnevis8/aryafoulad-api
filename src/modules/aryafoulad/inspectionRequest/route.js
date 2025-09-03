const express = require("express");
const router = express.Router();
const InspectionRequestController = require("./controller");
const { authenticateUser } = require("../../user/auth/middleware");

// دریافت تمام درخواست‌ها
router.get("/getAll", authenticateUser, InspectionRequestController.getAll);

// دریافت درخواست بر اساس ID
router.get("/getOne/:id", authenticateUser, InspectionRequestController.getById);

// ایجاد درخواست جدید (بدون نیاز به احراز هویت - برای عموم)
router.post("/create", InspectionRequestController.create);

// به‌روزرسانی وضعیت درخواست (موقتاً بدون authentication برای تست)
router.patch("/updateStatus/:id", InspectionRequestController.updateStatus);

// تبدیل درخواست به مشتری (حذف شده)
// router.post("/convertToCustomer/:id", authenticateUser, InspectionRequestController.convertToCustomer);

// حذف درخواست (موقتاً بدون authentication برای تست)
router.delete("/delete/:id", InspectionRequestController.delete);

module.exports = router;
