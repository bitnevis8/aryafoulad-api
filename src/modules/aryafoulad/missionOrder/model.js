const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database/mysql/connection');

const MissionOrder = sequelize.define('MissionOrder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    personnelNumber: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    fromUnit: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    day: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    time: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    destinations: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        get() {
            const value = this.getDataValue('destinations');
            return value ? JSON.parse(value) : [];
        },
        set(value) {
            this.setDataValue('destinations', JSON.stringify(value));
        }
    },
    missionCoordinates: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    missionSubject: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    missionDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    companions: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    transport: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    totalWeightKg: { 
        type: DataTypes.FLOAT,
        allowNull: true,
        get() {
            const value = this.getDataValue('totalWeightKg');
            return value ? parseFloat(value) : null;
        }
    },
    distance: { 
        type: DataTypes.FLOAT,
        allowNull: true,
        get() {
            const value = this.getDataValue('distance');
            return value ? parseFloat(value) : null;
        }
    },
    roundTripDistance: { 
        type: DataTypes.FLOAT,
        allowNull: true,
        get() {
            const value = this.getDataValue('roundTripDistance');
            return value ? parseFloat(value) : null;
        }
    },
    estimatedTime: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    estimatedReturnTime: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    sessionCode: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'کد شماره صورت جلسه'
    },
    ratePerKm: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 2500,
        comment: 'نرخ به ازای هر کیلومتر'
    },
    finalCost: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'هزینه نهایی (مسافت کل * نرخ به ازای کیلومتر)'
    },
    qrCode: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'QR Code برای دسترسی سریع به جزئیات ماموریت'
    }
}, {
    tableName: 'mission_orders',
    timestamps: true,
    paranoid: true
});

// مدل برای ارتباط many-to-many بین ماموریت و همراهان
const MissionCompanion = sequelize.define('MissionCompanion', {
    missionOrderId: {
        type: DataTypes.INTEGER,
        references: {
            model: MissionOrder,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'mission_companions',
    timestamps: true
});

module.exports = { MissionOrder, MissionCompanion };