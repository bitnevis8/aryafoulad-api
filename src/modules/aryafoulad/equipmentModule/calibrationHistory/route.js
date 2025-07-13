const express = require('express');
const router = express.Router();
const CalibrationHistoryController = require('./controller');

// Calibration history routes
router.get('/getAll', CalibrationHistoryController.getAll);
router.get('/getOne/:id', CalibrationHistoryController.getOne);
router.get('/getByEquipment/:equipmentId', CalibrationHistoryController.getByEquipment);
router.post('/create', CalibrationHistoryController.create);
router.put('/update/:id', CalibrationHistoryController.update);
router.delete('/delete/:id', CalibrationHistoryController.delete);

// ===== گزارش‌های کالیبراسیون =====
router.get('/report', CalibrationHistoryController.getCalibrationReport);
router.get('/expired', CalibrationHistoryController.getExpiredCalibrations);
router.get('/near-expiry', CalibrationHistoryController.getNearExpiryCalibrations);
router.get('/recent', CalibrationHistoryController.getRecentCalibrations);

module.exports = router; 