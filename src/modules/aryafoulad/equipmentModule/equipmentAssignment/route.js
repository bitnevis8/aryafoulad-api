const express = require('express');
const router = express.Router();
const EquipmentAssignmentController = require('./controller');

// Equipment assignment routes
router.get('/getAll', EquipmentAssignmentController.getAll);
router.get('/getOne/:id', EquipmentAssignmentController.getOne);
router.get('/getByEquipment/:equipmentId', EquipmentAssignmentController.getByEquipment);
router.post('/create', EquipmentAssignmentController.create);
router.put('/update/:id', EquipmentAssignmentController.update);
router.put('/return/:id', EquipmentAssignmentController.returnEquipment);
router.delete('/delete/:id', EquipmentAssignmentController.delete);

// Test endpoint for debugging
router.get('/test', async (req, res) => {
  try {
    const EquipmentAssignment = require('./model');
    const Equipment = require('../equipment/model');
    const User = require('../../../user/user/model');
    
    console.log('🧪 Testing associations...');
    
    // Test basic query
    const assignments = await EquipmentAssignment.findAll({
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'equipment_code']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      limit: 1
    });
    
    console.log('📊 Test result:', JSON.stringify(assignments, null, 2));
    
    res.json({
      success: true,
      data: assignments,
      message: 'Test completed'
    });
  } catch (error) {
    console.error('❌ Test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router; 