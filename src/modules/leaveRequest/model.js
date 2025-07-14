const { DataTypes } = require('sequelize');
const sequelize = require('../../core/database/sequelize');

const LeaveRequest = sequelize.define('LeaveRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  startTime: { type: DataTypes.TIME, allowNull: true },
  endTime: { type: DataTypes.TIME, allowNull: true },
  daysCount: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0 },
  isHourly: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  type: { 
    type: DataTypes.ENUM('annual', 'sick', 'unpaid'), 
    allowNull: false,
    comment: 'annual: استحقاقی, sick: استعلاجی, unpaid: بدون حقوق'
  },
  status: { 
    type: DataTypes.ENUM('pending', 'staff_approved', 'staff_rejected', 'final_approved', 'final_rejected'), 
    allowNull: false, 
    defaultValue: 'pending',
    comment: 'pending: در انتظار, staff_approved: تایید ستادی, staff_rejected: رد ستادی, final_approved: تایید نهایی, final_rejected: رد نهایی'
  },
  staffApproverId: { type: DataTypes.INTEGER, allowNull: true },
  finalApproverId: { type: DataTypes.INTEGER, allowNull: true },
  staffApprovalDate: { type: DataTypes.DATE, allowNull: true },
  finalApprovalDate: { type: DataTypes.DATE, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  rejectReason: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'leave_requests',
  timestamps: true,
  underscored: true,
});

module.exports = LeaveRequest; 