const { DataTypes } = require('sequelize');
const sequelize = require('../../../../core/database/sequelize');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'نام تجهیز'
  },
  equipment_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'کد تجهیز'
  },
  type: {
    type: DataTypes.ENUM('company_asset', 'inspection_equipment'),
    allowNull: false,
    comment: 'نوع تجهیز: اموال شرکت یا تجهیزات بازرسی'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'دسته‌بندی تجهیز'
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'مدل تجهیز'
  },
  serial_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'شماره سریال'
  },
  manufacturer: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'سازنده'
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'تاریخ خرید'
  },
  purchase_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'قیمت خرید (ریال)'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'موقعیت فعلی'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'توضیحات'
  },
  needs_calibration: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'نیاز به کالیبراسیون دارد'
  },
  calibration_certificate: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'شماره گواهی کالیبراسیون'
  },
  calibration_period_years: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'دوره کالیبراسیون (سال)'
  },
  calibration_place: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'محل کالیبراسیون'
  },
  last_calibration_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'تاریخ آخرین کالیبراسیون'
  },
  next_calibration_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'تاریخ کالیبراسیون بعدی'
  },
  has_identity_document: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'دارای مدارک شناسایی'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'یادداشت‌های اضافی'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'retired'),
    defaultValue: 'active',
    comment: 'وضعیت تجهیز'
  }
}, {
  tableName: 'equipment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: 'جدول تجهیزات انبار'
});

module.exports = Equipment; 