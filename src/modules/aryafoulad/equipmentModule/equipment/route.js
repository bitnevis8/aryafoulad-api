const express = require('express');
const router = express.Router();
const EquipmentController = require('./controller');

// Equipment routes
router.get('/getAll', EquipmentController.getAll);
router.get('/getOne/:id', EquipmentController.getOne);
router.post('/create', EquipmentController.create);
router.put('/update/:id', EquipmentController.update);
router.delete('/delete/:id', EquipmentController.delete);
router.get('/search', EquipmentController.search);

module.exports = router; 