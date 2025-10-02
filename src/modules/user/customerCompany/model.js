const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database/mysql/connection');

const CustomerCompany = sequelize.define('CustomerCompany', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'شناسه مشتری (User)'
  },
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'نام شرکت'
  },
  entityType: {
    type: DataTypes.ENUM('company', 'branch'),
    allowNull: false,
    defaultValue: 'company',
    comment: 'نوع موجودیت: company برای مشتری حقیقی، branch برای مشتری حقوقی'
  },
  companyType: {
    type: DataTypes.ENUM('manufacturing', 'trading', 'service', 'construction', 'other'),
    allowNull: true,
    defaultValue: 'other',
    comment: 'نوع شرکت'
  },
  registrationNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'شماره ثبت شرکت'
  },
  nationalId: {
    type: DataTypes.STRING(11),
    allowNull: true,
    comment: 'شناسه ملی شرکت'
  },
  economicCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'کد اقتصادی'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'تلفن شرکت'
  },
  fax: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'نمابر'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ایمیل شرکت'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'آدرس شرکت'
  },
  province: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'استان'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'شهر'
  },
  postalCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'کد پستی'
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'عرض جغرافیایی'
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'طول جغرافیایی'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'وضعیت فعال بودن'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'توضیحات'
  }
}, {
  tableName: 'customer_companies',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['customerId']
    },
    {
      fields: ['companyName']
    },
    {
      fields: ['nationalId']
    }
  ]
});

module.exports = CustomerCompany;
