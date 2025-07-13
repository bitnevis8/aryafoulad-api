const express = require('express');
const router = express.Router();

// Import submodule routes
const warehouseRoutes = require('./warehouse/route');
const equipmentRoutes = require('./equipment/route');
const equipmentAssignmentRoutes = require('./equipmentAssignment/route');
const calibrationHistoryRoutes = require('./calibrationHistory/route');

// Use warehouse routes
router.use('/warehouse', warehouseRoutes);

// Use equipment routes
router.use('/equipment', equipmentRoutes);

// Use equipment assignment routes
router.use('/equipment-assignment', equipmentAssignmentRoutes);

// Use calibration history routes
router.use('/calibration-history', calibrationHistoryRoutes);

module.exports = router; 