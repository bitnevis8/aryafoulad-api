const LeaveRequest = require('./model');
const User = require('../user/user/model');

// تعریف ارتباط بین LeaveRequest و User
LeaveRequest.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user',
  onDelete: 'CASCADE'
});

User.hasMany(LeaveRequest, { 
  foreignKey: 'userId', 
  as: 'leaveRequests'
});

module.exports = {
  LeaveRequest,
  User
}; 