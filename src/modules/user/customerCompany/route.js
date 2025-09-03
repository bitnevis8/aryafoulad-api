const express = require('express');
const router = express.Router();
const customerCompanyController = require('./controller');

// دریافت لیست همه شرکت‌ها
router.get('/getAll', customerCompanyController.getAll);

// دریافت شرکت‌های یک مشتری
router.get('/customer/:customerId', customerCompanyController.getByCustomerId);

// دریافت یک شرکت
router.get('/:id', customerCompanyController.getById);

// ایجاد شرکت جدید
router.post('/create', customerCompanyController.create);

// به‌روزرسانی شرکت
router.put('/update/:id', customerCompanyController.update);

// حذف شرکت
router.delete('/delete/:id', customerCompanyController.delete);

module.exports = router;
