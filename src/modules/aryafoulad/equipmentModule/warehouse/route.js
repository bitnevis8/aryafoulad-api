const express = require('express');
const router = express.Router();
const warehouseController = require('./controller');

// روت‌های مربوط به انبار
router.get('/getAll', warehouseController.getAll); // دریافت تمام انبارها
router.get('/search', warehouseController.search); // جستجوی انبارها
router.get('/getOne/:id', warehouseController.getOne); // دریافت یک انبار
router.post('/create', warehouseController.create); // ایجاد انبار جدید
router.put('/update/:id', warehouseController.update); // ویرایش انبار
router.delete('/delete/:id', warehouseController.delete); // حذف انبار

module.exports = router; 