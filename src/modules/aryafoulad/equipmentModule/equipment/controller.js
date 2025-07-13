const Equipment = require('./model');
const { Op } = require('sequelize');

class EquipmentController {
  // Get all equipment with optional includes
  static async getAll(req, res) {
    try {
      const equipment = await Equipment.findAll({
        include: [
          {
            model: require('../equipmentAssignment/model'),
            as: 'current_assignment',
            attributes: ['id', 'user_id', 'assigned_at'],
            where: {
              returned_at: null // فقط واگذاری‌های فعال (بدون بازگشت)
            },
            required: false, // LEFT JOIN
            include: [
              {
                model: require('../../../user/user/model'),
                as: 'user',
                attributes: ['id', 'firstName', 'lastName']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: equipment
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت تجهیزات'
      });
    }
  }

  // Get single equipment by ID
  static async getOne(req, res) {
    try {
      const { id } = req.params;
      const equipment = await Equipment.findByPk(id);

      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'تجهیز یافت نشد'
        });
      }

      res.json({
        success: true,
        data: equipment
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت تجهیز'
      });
    }
  }

  // Create new equipment
  static async create(req, res) {
    try {
      const equipmentData = req.body;
      
      // بررسی تکراری نبودن کد تجهیز
      const existingEquipment = await Equipment.findOne({
        where: { equipment_code: equipmentData.equipment_code }
      });
      
      if (existingEquipment) {
        return res.status(400).json({
          success: false,
          message: 'کد تجهیز تکراری است. لطفاً کد دیگری انتخاب کنید.'
        });
      }

      const equipment = await Equipment.create(equipmentData);

      res.status(201).json({
        success: true,
        data: equipment,
        message: 'تجهیز با موفقیت ایجاد شد'
      });
    } catch (error) {
      console.error('Error creating equipment:', error);
      
      // بررسی خطاهای Sequelize
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'کد تجهیز تکراری است. لطفاً کد دیگری انتخاب کنید.'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'خطا در ایجاد تجهیز'
      });
    }
  }

  // Update equipment
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const equipment = await Equipment.findByPk(id);
      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'تجهیز یافت نشد'
        });
      }

      await equipment.update(updateData);

      res.json({
        success: true,
        data: equipment,
        message: 'تجهیز با موفقیت به‌روزرسانی شد'
      });
    } catch (error) {
      console.error('Error updating equipment:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در به‌روزرسانی تجهیز'
      });
    }
  }

  // Delete equipment
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const equipment = await Equipment.findByPk(id);

      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'تجهیز یافت نشد'
        });
      }

      await equipment.destroy();

      res.json({
        success: true,
        message: 'تجهیز با موفقیت حذف شد'
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در حذف تجهیز'
      });
    }
  }

  // Search equipment
  static async search(req, res) {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'پارامتر جستجو الزامی است'
        });
      }

      const equipment = await Equipment.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { equipment_code: { [Op.like]: `%${query}%` } },
            { category: { [Op.like]: `%${query}%` } }
          ]
        },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: equipment
      });
    } catch (error) {
      console.error('Error searching equipment:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در جستجوی تجهیزات'
      });
    }
  }
}

module.exports = EquipmentController; 