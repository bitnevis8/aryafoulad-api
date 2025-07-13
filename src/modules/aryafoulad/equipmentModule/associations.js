const Warehouse = require('./warehouse/model');
const CalibrationHistory = require('./calibrationHistory/model');
const Equipment = require('./equipment/model');
const EquipmentAssignment = require('./equipmentAssignment/model');
const User = require('../../user/user/model');

// تعریف ارتباطات ماژول مدیریت تجهیزات
const defineAssociations = () => {
    console.log('🔗 Defining Equipment Module Associations...');
    
    // ===== روابط جدید برای سیستم تجهیزات =====

    // روابط تجهیز و واگذاری تجهیز (One-to-Many)
    Equipment.hasMany(EquipmentAssignment, { 
        foreignKey: 'equipment_id', 
        as: 'assignments',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });
    EquipmentAssignment.belongsTo(Equipment, { 
        foreignKey: 'equipment_id', 
        as: 'equipment',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });

    // روابط تجهیز و تاریخچه کالیبراسیون (One-to-Many)
    Equipment.hasMany(CalibrationHistory, { 
        foreignKey: 'equipment_id', 
        as: 'calibrationHistory',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    CalibrationHistory.belongsTo(Equipment, { 
        foreignKey: 'equipment_id', 
        as: 'equipment',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    // روابط واگذاری تجهیز و کاربران
    EquipmentAssignment.belongsTo(User, { 
        foreignKey: 'user_id', 
        as: 'user',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });

    // روابط تجهیز و واگذاری فعلی (One-to-One)
    Equipment.hasOne(EquipmentAssignment, { 
        foreignKey: 'equipment_id', 
        as: 'current_assignment',
        scope: { returned_at: null },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });
    
    console.log('✅ Equipment Module Associations defined successfully');
};

module.exports = defineAssociations;
