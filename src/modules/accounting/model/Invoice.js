const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../core/database/mysql/connection');

class Invoice extends Model {}

Invoice.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.ENUM('invoice', 'proforma'), allowNull: false, defaultValue: 'proforma' },
  number: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  file_number: { type: DataTypes.STRING(64), allowNull: true },
  invoice_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

  customer_id: { type: DataTypes.INTEGER, allowNull: true, comment: 'شناسه کاربر مشتری' },
  customer_company_id: { type: DataTypes.INTEGER, allowNull: true, comment: 'شناسه شرکت مشتری' },

  buyer_legal_name: { type: DataTypes.STRING, allowNull: true },
  buyer_province: { type: DataTypes.STRING, allowNull: true },
  buyer_city: { type: DataTypes.STRING, allowNull: true },
  buyer_address: { type: DataTypes.TEXT, allowNull: true },
  buyer_registration_number: { type: DataTypes.STRING, allowNull: true },
  buyer_economic_code: { type: DataTypes.STRING, allowNull: true },
  buyer_postal_code: { type: DataTypes.STRING, allowNull: true },
  buyer_national_identifier: { type: DataTypes.STRING, allowNull: true },
  buyer_phone: { type: DataTypes.STRING, allowNull: true },
  buyer_fax: { type: DataTypes.STRING, allowNull: true },

  // Invoice items and calculations
  items: { type: DataTypes.JSON, allowNull: true, comment: 'آیتم‌های فاکتور' },
  travel_cost: { type: DataTypes.DECIMAL(15,2), allowNull: true, defaultValue: 0 },
  tax_percent: { type: DataTypes.DECIMAL(5,2), allowNull: true, defaultValue: 0 },
  duties_percent: { type: DataTypes.DECIMAL(5,2), allowNull: true, defaultValue: 0 },
  description: { type: DataTypes.TEXT, allowNull: true, comment: 'توضیحات فاکتور' },
  selected_account_id: { type: DataTypes.INTEGER, allowNull: true, comment: 'شناسه حساب بانکی انتخاب شده' },

}, {
  sequelize,
  modelName: 'Invoice',
  tableName: 'invoices',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['type'] },
    { fields: ['customer_id'] },
    { fields: ['customer_company_id'] },
  ]
});

module.exports = Invoice;


