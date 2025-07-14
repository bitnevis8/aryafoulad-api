const express = require('express');
const router = express.Router();
const LeaveRequestController = require('./controller');
const { authenticateUser } = require('../user/auth/middleware');

// ثبت درخواست مرخصی
router.post('/create', authenticateUser, LeaveRequestController.create);
// مشاهده درخواست‌های خود کاربر
router.get('/my', authenticateUser, LeaveRequestController.getMyRequests);
// مشاهده همه درخواست‌ها (ستادی/مدیر کل)
router.get('/all', authenticateUser, LeaveRequestController.getAll);
// تایید یا رد درخواست
router.patch('/approve/:id', authenticateUser, LeaveRequestController.approve);
// گزارش‌گیری
router.get('/report', authenticateUser, LeaveRequestController.report);
// دریافت لیست انواع مرخصی
router.get('/types', authenticateUser, LeaveRequestController.getTypes);

module.exports = router; 