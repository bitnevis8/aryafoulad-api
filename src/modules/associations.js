const User = require('./user/user/model');
const Role = require('./user/role/model');
const UserRole = require('./user/userRole/model');
const { MissionOrder, MissionCompanion } = require('./aryafoulad/missionOrder/model');
const FileUpload = require('./fileUpload/model');




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




};

module.exports = defineAssociations; 