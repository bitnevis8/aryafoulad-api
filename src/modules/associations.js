const User = require('./user/user/model');
const { MissionOrder, MissionCompanion } = require('./aryafoulad/missionOrder/model');
const FileUpload = require('./fileUpload/model');
const LeaveRequest = require('./leaveRequest/model');
const InspectionRequest = require('./aryafoulad/inspectionRequest/model');
const { ProjectType } = require('./aryafoulad/projects/models');
const Invoice = require('./accounting/model/Invoice');
const CustomerCompany = require('./user/customerCompany/model');
const Service = require('./accounting/model/Service');




// تعریف ارتباطات بین مدل‌ها
const defineAssociations = () => {
    // ارتباطات User و Role (تعریف شده در ماژول user)

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

    // ارتباط مرخصی با کاربر (تعریف شده در بخش مرخصی)

    // ارتباطات InspectionRequest (تعریف شده در بخش درخواست بازرسی)

    // ارتباطات مربوط به حسابداری
    // Invoice relations
    Invoice.belongsTo(User, { foreignKey: 'customer_id', as: 'customer', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    User.hasMany(Invoice, { foreignKey: 'customer_id', as: 'invoices', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

    Invoice.belongsTo(CustomerCompany, { foreignKey: 'customer_company_id', as: 'customerCompany', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    CustomerCompany.hasMany(Invoice, { foreignKey: 'customer_company_id', as: 'companyInvoices', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

    // Service relations
    Service.belongsTo(User, { foreignKey: 'responsible_user_id', as: 'responsible', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    User.hasMany(Service, { foreignKey: 'responsible_user_id', as: 'services', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

    // ارتباطات مربوط به مرخصی
    LeaveRequest.belongsTo(User, { 
        foreignKey: 'userId', 
        as: 'user',
        onDelete: 'CASCADE'
    });
    User.hasMany(LeaveRequest, { 
        foreignKey: 'userId', 
        as: 'leaveRequests'
    });

    // ارتباطات مربوط به درخواست بازرسی
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
    InspectionRequest.belongsTo(User, {
        foreignKey: 'customer_id',
        as: 'customer',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });

    // ارتباطات مربوط به ماژول تجهیزات (تعریف شده در ماژول equipmentModule)

};

module.exports = defineAssociations; 