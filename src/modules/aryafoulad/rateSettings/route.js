const express = require('express');
const router = express.Router();
const rateSettingController = require('./controller');

// دریافت لیست همه نرخ‌ها
router.get('/getAll', rateSettingController.getAll);

// دریافت نرخ‌های غیرفعال
router.get('/getInactive', rateSettingController.getInactive);

// دریافت نرخ فعال
router.get('/getActive', rateSettingController.getActive);

// دریافت وضعیت نرخ‌ها
router.get('/getStatus', rateSettingController.getRateStatus);

// دریافت نرخ بر اساس تاریخ ماموریت
router.get('/getRateByDate', rateSettingController.getRateByDate);

// ایجاد نرخ جدید
router.post('/create', rateSettingController.create);

// به‌روزرسانی نرخ
router.put('/update/:id', rateSettingController.update);

// فعال/غیرفعال کردن نرخ
router.patch('/toggle-active/:id', rateSettingController.toggleActive);

// حذف نرخ
router.delete('/delete/:id', rateSettingController.delete);

// دریافت نرخ با شناسه (باید در آخر باشد)
router.get('/:id', rateSettingController.getById);

module.exports = router; 