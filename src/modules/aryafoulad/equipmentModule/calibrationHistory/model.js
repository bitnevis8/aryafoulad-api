const { DataTypes } = require('sequelize');
const sequelize = require('../../../../core/database/sequelize');

const CalibrationHistory = sequelize.define('CalibrationHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    },
    comment: 'شناسه تجهیز'
  },
  calibration_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'تاریخ کالیبراسیون'
  },
  next_calibration_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'تاریخ کالیبراسیون بعدی'
  },
  calibration_place: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'محل کالیبراسیون'
  },
  certificate_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'شماره گواهی کالیبراسیون'
  },
  calibrated_by: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'کالیبره شده توسط'
  },
  cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'هزینه کالیبراسیون (ریال)'
  },
  result: {
    type: DataTypes.ENUM('pass', 'fail', 'conditional'),
    allowNull: true,
    comment: 'نتیجه کالیبراسیون'
  },
  accuracy: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'دقت کالیبراسیون'
  },
  uncertainty: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'عدم قطعیت'
  },
  environmental_conditions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'شرایط محیطی'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'یادداشت‌ها'
  },
  attachments: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'فایل‌های پیوست (JSON)'
  }
}, {
  tableName: 'calibration_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: 'جدول تاریخچه کالیبراسیون تجهیزات'
});

module.exports = CalibrationHistory; 