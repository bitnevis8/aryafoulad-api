const User = require('./user/user/model');
const Role = require('./user/role/model');
const UserRole = require('./user/userRole/model');
const { MissionOrder, MissionCompanion } = require('./aryafoulad/missionOrder/model');
const FileUpload = require('./fileUpload/model');
const LeaveRequest = require('./leaveRequest/model');
const InspectionRequest = require('./aryafoulad/inspectionRequest/model');
const { ProjectType } = require('./aryafoulad/projects/models');




// تعریف ارتباطات بین مدل‌ها
const defineAssociations = () => {
    // ارتباطات Many-to-Many بین User و Role
    User.belongsToMany(Role, {
        through: UserRole,
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'roles',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Role.belongsToMany(User, {
        through: UserRole,
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    // ارتباطات UserRole با User و Role
    UserRole.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    UserRole.belongsTo(Role, {
        foreignKey: 'roleId',
        as: 'role',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    // ارتباطات مربوط به ماموریت‌ها
    MissionOrder.belongsTo(User, { 
        foreignKey: 'userId', 
        as: 'user',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });
    MissionOrder.belongsToMany(User, { 
        through: MissionCompanion, 
        as: 'missionCompanions',
        foreignKey: 'missionOrderId',
        otherKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    User.belongsToMany(MissionOrder, { 
        through: MissionCompanion, 
        as: 'missions',
        foreignKey: 'userId',
        otherKey: 'missionOrderId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    // ارتباطات مربوط به فایل‌ها
    MissionOrder.hasMany(FileUpload, {
        foreignKey: 'missionOrderId',
        as: 'files',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    FileUpload.belongsTo(MissionOrder, {
        foreignKey: 'missionOrderId',
        as: 'missionOrder',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    // ارتباط مرخصی با کاربر
    LeaveRequest.belongsTo(User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(LeaveRequest, { as: 'leaveRequests', foreignKey: 'userId', onDelete: 'CASCADE' });

    // ارتباطات InspectionRequest
    InspectionRequest.belongsTo(ProjectType, {
        foreignKey: 'project_type_id',
        as: 'projectType',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });
    InspectionRequest.belongsTo(User, {
        foreignKey: 'reviewed_by',
        as: 'reviewer',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });


};

module.exports = defineAssociations; 