const CalibrationHistory = require('./model');
const Equipment = require('../equipment/model');
const { Op } = require('sequelize');

class CalibrationHistoryController {
  // Get all calibration history
  static async getAll(req, res) {
    try {
      const calibrations = await CalibrationHistory.findAll({
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: calibrations
      });
    } catch (error) {
      console.error('Error fetching calibration history:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت تاریخچه کالیبراسیون'
      });
    }
  }

  // Get single calibration by ID
  static async getOne(req, res) {
    try {
      const { id } = req.params;
      const calibration = await CalibrationHistory.findByPk(id, {
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          }
        ]
      });

      if (!calibration) {
        return res.status(404).json({
          success: false,
          message: 'کالیبراسیون یافت نشد'
        });
      }

      res.json({
        success: true,
        data: calibration
      });
    } catch (error) {
      console.error('Error fetching calibration:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت کالیبراسیون'
      });
    }
  }

  // Get calibrations by equipment ID
  static async getByEquipment(req, res) {
    try {
      const { equipmentId } = req.params;
      const calibrations = await CalibrationHistory.findAll({
        where: { equipment_id: equipmentId },
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: calibrations
      });
    } catch (error) {
      console.error('Error fetching equipment calibrations:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت کالیبراسیون‌های تجهیز'
      });
    }
  }

  // Create new calibration
  static async create(req, res) {
    try {
      const calibrationData = req.body;
      const calibration = await CalibrationHistory.create(calibrationData);

      // Get the created calibration with includes
      const createdCalibration = await CalibrationHistory.findByPk(calibration.id, {
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: createdCalibration,
        message: 'کالیبراسیون با موفقیت ثبت شد'
      });
    } catch (error) {
      console.error('Error creating calibration:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در ثبت کالیبراسیون'
      });
    }
  }

  // Update calibration
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const calibration = await CalibrationHistory.findByPk(id);
      if (!calibration) {
        return res.status(404).json({
          success: false,
          message: 'کالیبراسیون یافت نشد'
        });
      }

      await calibration.update(updateData);

      // Get the updated calibration with includes
      const updatedCalibration = await CalibrationHistory.findByPk(id, {
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          }
        ]
      });

      res.json({
        success: true,
        data: updatedCalibration,
        message: 'کالیبراسیون با موفقیت به‌روزرسانی شد'
      });
    } catch (error) {
      console.error('Error updating calibration:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در به‌روزرسانی کالیبراسیون'
      });
    }
  }

  // Delete calibration
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const calibration = await CalibrationHistory.findByPk(id);

      if (!calibration) {
        return res.status(404).json({
          success: false,
          message: 'کالیبراسیون یافت نشد'
        });
      }

      await calibration.destroy();

      res.json({
        success: true,
        message: 'کالیبراسیون با موفقیت حذف شد'
      });
    } catch (error) {
      console.error('Error deleting calibration:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در حذف کالیبراسیون'
      });
    }
  }

  // ===== گزارش‌های کالیبراسیون =====

  // گزارش وضعیت کلی کالیبراسیون
  static async getCalibrationReport(req, res) {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      const sixtyDaysFromNow = new Date(today.getTime() + (60 * 24 * 60 * 60 * 1000));

      // تجهیزات نیازمند کالیبراسیون
      const equipmentNeedingCalibration = await Equipment.findAll({
        where: {
          needs_calibration: true
        },
        include: [
          {
            model: CalibrationHistory,
            as: 'calibrationHistory',
            attributes: ['id', 'calibration_date', 'next_calibration_date', 'certificate_number'],
            order: [['calibration_date', 'DESC']],
            limit: 1
          }
        ],
        order: [['next_calibration_date', 'ASC']]
      });

      // آمار کلی
      const totalEquipment = await Equipment.count();
      const equipmentWithCalibration = await Equipment.count({
        where: { needs_calibration: true }
      });
      const expiredCalibrations = await Equipment.count({
        where: {
          needs_calibration: true,
          next_calibration_date: { [Op.lt]: today }
        }
      });
      const nearExpiryCalibrations = await Equipment.count({
        where: {
          needs_calibration: true,
          next_calibration_date: { [Op.between]: [today, thirtyDaysFromNow] }
        }
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalEquipment,
            equipmentWithCalibration,
            expiredCalibrations,
            nearExpiryCalibrations,
            recentCalibrations: 0
          },
          equipmentNeedingCalibration
        }
      });
    } catch (error) {
      console.error('Error generating calibration report:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در تولید گزارش کالیبراسیون'
      });
    }
  }

  // گزارش تجهیزات منقضی شده
  static async getExpiredCalibrations(req, res) {
    try {
      const today = new Date();
      
      const expiredEquipment = await Equipment.findAll({
        where: {
          needs_calibration: true,
          next_calibration_date: { [Op.lt]: today }
        },
        include: [
          {
            model: CalibrationHistory,
            as: 'calibrationHistory',
            attributes: ['id', 'calibration_date', 'next_calibration_date', 'certificate_number'],
            order: [['calibration_date', 'DESC']],
            limit: 1
          }
        ],
        order: [['next_calibration_date', 'ASC']]
      });

      res.json({
        success: true,
        data: expiredEquipment
      });
    } catch (error) {
      console.error('Error fetching expired calibrations:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت تجهیزات منقضی شده'
      });
    }
  }

  // گزارش تجهیزات نزدیک به انقضا
  static async getNearExpiryCalibrations(req, res) {
    try {
      const { days = 30 } = req.query;
      const today = new Date();
      const expiryDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
      
      const nearExpiryEquipment = await Equipment.findAll({
        where: {
          needs_calibration: true,
          next_calibration_date: { 
            [Op.between]: [today, expiryDate] 
          }
        },
        include: [
          {
            model: CalibrationHistory,
            as: 'calibrationHistory',
            attributes: ['id', 'calibration_date', 'next_calibration_date', 'certificate_number'],
            order: [['calibration_date', 'DESC']],
            limit: 1
          }
        ],
        order: [['next_calibration_date', 'ASC']]
      });

      res.json({
        success: true,
        data: nearExpiryEquipment
      });
    } catch (error) {
      console.error('Error fetching near expiry calibrations:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت تجهیزات نزدیک به انقضا'
      });
    }
  }

  // گزارش کالیبراسیون‌های اخیر
  static async getRecentCalibrations(req, res) {
    try {
      const { days = 30 } = req.query;
      const today = new Date();
      const startDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const recentCalibrations = await CalibrationHistory.findAll({
        where: {
          calibration_date: { [Op.gte]: startDate }
        },
        include: [
          {
            model: Equipment,
            as: 'equipment',
            attributes: ['id', 'name', 'equipment_code', 'type', 'category']
          }
        ],
        order: [['calibration_date', 'DESC']]
      });

      res.json({
        success: true,
        data: recentCalibrations
      });
    } catch (error) {
      console.error('Error fetching recent calibrations:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت کالیبراسیون‌های اخیر'
      });
    }
  }
}

module.exports = CalibrationHistoryController; 