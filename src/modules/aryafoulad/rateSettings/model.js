const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database/mysql/connection');

const RateSetting = sequelize.define('RateSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'عنوان نرخ'
    },
    ratePerKm: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 2500,
        comment: 'نرخ به ازای هر کیلومتر'
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'تاریخ شروع اعتبار نرخ (شمسی)'
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'تاریخ پایان اعتبار نرخ (شمسی) - اگر null باشد، نرخ تا زمان حال معتبر است'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'وضعیت فعال بودن نرخ'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'توضیحات نرخ'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'شناسه کاربر ایجاد کننده'
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'شناسه کاربر ویرایش کننده'
    }
}, {
    tableName: 'rate_settings',
    timestamps: true,
    paranoid: true
});

module.exports = RateSetting; 