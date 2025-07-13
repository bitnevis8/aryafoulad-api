const EquipmentAssignment = require('./model');
const Equipment = require('../equipment/model');
const User = require('../../../user/user/model');

class EquipmentAssignmentController {
  // Get all equipment assignments
  static async getAll(req, res) {
    try {
      const assignments = await EquipmentAssignment.findAll({
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error fetching equipment assignments:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت واگذاری‌ها'
      });
    }
  }

  // Get single equipment assignment by ID
  static async getOne(req, res) {
    try {
      const { id } = req.params;
      const assignment = await EquipmentAssignment.findByPk(id, {
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'واگذاری یافت نشد'
        });
      }

      res.json({
        success: true,
        data: assignment
      });
    } catch (error) {
      console.error('Error fetching equipment assignment:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت واگذاری'
      });
    }
  }

  // Get assignments by equipment ID
  static async getByEquipment(req, res) {
    try {
      const { equipmentId } = req.params;
      const assignments = await EquipmentAssignment.findAll({
        where: { equipment_id: equipmentId },
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error fetching equipment assignments:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت واگذاری‌های تجهیز'
      });
    }
  }

  // Create new equipment assignment
  static async create(req, res) {
    try {
      const assignmentData = req.body;

      // Check if equipment is already assigned
      const existingAssignment = await EquipmentAssignment.findOne({
        where: {
          equipment_id: assignmentData.equipment_id,
          returned_at: null
        }
      });

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'این تجهیز قبلاً واگذار شده است'
        });
      }

      const assignment = await EquipmentAssignment.create(assignmentData);

      // Get the created assignment with includes
      const createdAssignment = await EquipmentAssignment.findByPk(assignment.id, {
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: createdAssignment,
        message: 'واگذاری با موفقیت ایجاد شد'
      });
    } catch (error) {
      console.error('Error creating equipment assignment:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در ایجاد واگذاری'
      });
    }
  }

  // Update equipment assignment
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const assignment = await EquipmentAssignment.findByPk(id);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'واگذاری یافت نشد'
        });
      }

      await assignment.update(updateData);

      // Get the updated assignment with includes
      const updatedAssignment = await EquipmentAssignment.findByPk(id, {
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.json({
        success: true,
        data: updatedAssignment,
        message: 'واگذاری با موفقیت به‌روزرسانی شد'
      });
    } catch (error) {
      console.error('Error updating equipment assignment:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در به‌روزرسانی واگذاری'
      });
    }
  }

  // Return equipment
  static async returnEquipment(req, res) {
    try {
      const { id } = req.params;
      const { returned_at } = req.body;

      const assignment = await EquipmentAssignment.findByPk(id);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'واگذاری یافت نشد'
        });
      }

      if (assignment.returned_at) {
        return res.status(400).json({
          success: false,
          message: 'این تجهیز قبلاً بازگشت داده شده است'
        });
      }

      await assignment.update({ returned_at: returned_at || new Date() });

      res.json({
        success: true,
        message: 'تجهیز با موفقیت بازگشت داده شد'
      });
    } catch (error) {
      console.error('Error returning equipment:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در بازگشت تجهیز'
      });
    }
  }

  // Delete equipment assignment
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const assignment = await EquipmentAssignment.findByPk(id);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'واگذاری یافت نشد'
        });
      }

      await assignment.destroy();

      res.json({
        success: true,
        message: 'واگذاری با موفقیت حذف شد'
      });
    } catch (error) {
      console.error('Error deleting equipment assignment:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در حذف واگذاری'
      });
    }
  }
}

module.exports = EquipmentAssignmentController; 