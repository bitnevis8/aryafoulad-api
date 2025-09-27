const express = require("express");
const router = express.Router();
const InspectionRequestController = require("./controller");
const { authenticateUser } = require("../../user/auth/middleware");

// دریافت تمام درخواست‌ها (موقتاً بدون authentication برای تست)
router.get("/getAll", InspectionRequestController.getAll);

// دریافت درخواست‌های تبدیل شده
router.get("/getConverted", InspectionRequestController.getConverted);

// دریافت درخواست بر اساس ID
router.get("/getOne/:id", authenticateUser, InspectionRequestController.getById);

// دریافت جزئیات درخواست (موقتاً بدون authentication برای تست)
router.get("/get/:id", InspectionRequestController.getById);

// ایجاد درخواست جدید (بدون نیاز به احراز هویت - برای عموم)
router.post("/create", InspectionRequestController.create);

// به‌روزرسانی وضعیت درخواست (موقتاً بدون authentication برای تست)
router.patch("/updateStatus/:id", InspectionRequestController.updateStatus);

// تبدیل درخواست به مشتری (حذف شده)
// router.post("/convertToCustomer/:id", authenticateUser, InspectionRequestController.convertToCustomer);

// حذف درخواست (موقتاً بدون authentication برای تست)
router.delete("/delete/:id", InspectionRequestController.delete);

// تبدیل درخواست به پروژه
router.post("/convertToProject/:id", InspectionRequestController.convertToProject);

module.exports = router;
