const express = require('express');
const missionOrderRoutes = require('./missionOrder/route');
const unitLocationRoutes = require('./unitLocation/route');
const rateSettingRoutes = require('./rateSettings/route');
const equipmentModuleRoutes = require('./equipmentModule/route');
const leaveRequestRoutes = require('../leaveRequest/route');
const projectsRoutes = require('./projects/route');

const router = express.Router();

// Use mission order routes
router.use('/mission-orders', missionOrderRoutes);

// Use unit location routes
router.use('/unit-locations', unitLocationRoutes);

// Use rate settings routes
router.use('/rate-settings', rateSettingRoutes);

// Use equipment module routes
router.use('/equipment-module', equipmentModuleRoutes);

// Use leave request routes
router.use('/leave-request', leaveRequestRoutes);

// Use projects routes
router.use('/projects', projectsRoutes);

// Additional routes for other modules can be added here

module.exports = router; 