const { DataTypes } = require('sequelize');
const sequelize = require('../../../../core/database/sequelize');

const EquipmentAssignment = sequelize.define('EquipmentAssignment', {
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'شناسه کاربر'
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'تاریخ واگذاری'
  },
  expected_return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'تاریخ بازگشت مورد انتظار'
  },
  returned_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاریخ بازگشت واقعی'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'توضیحات واگذاری'
  },
  status: {
    type: DataTypes.ENUM('active', 'returned', 'overdue'),
    defaultValue: 'active',
    comment: 'وضعیت واگذاری'
  }
}, {
  tableName: 'equipment_assignments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: 'جدول واگذاری تجهیزات'
});

module.exports = EquipmentAssignment; 