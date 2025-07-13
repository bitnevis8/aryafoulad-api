const express = require('express');
const router = express.Router();
const warehouseRoutes = require('./warehouse/route');
const equipmentRoutes = require('./equipment/route');
const equipmentAssignmentRoutes = require('./equipmentAssignment/route');
const calibrationHistoryRoutes = require('./calibrationHistory/route');
const initEquipmentModule = require('./init');

// تعریف روابط بین مدل‌ها
initEquipmentModule();

// تعریف روت‌ها
router.use('/warehouse', warehouseRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/equipment-assignment', equipmentAssignmentRoutes);
router.use('/calibration-history', calibrationHistoryRoutes);

module.exports = router; 