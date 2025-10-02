const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../core/database/mysql/connection');

class AccountingSettings extends Model {}

AccountingSettings.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  seller_name: { type: DataTypes.STRING, allowNull: true },
  seller_legal_name: { type: DataTypes.STRING, allowNull: true },
  seller_province: { type: DataTypes.STRING, allowNull: true },
  seller_city: { type: DataTypes.STRING, allowNull: true },
  seller_address: { type: DataTypes.TEXT, allowNull: true },
  seller_registration_number: { type: DataTypes.STRING, allowNull: true },
  seller_postal_code: { type: DataTypes.STRING, allowNull: true },
  seller_economic_code: { type: DataTypes.STRING, allowNull: true },
  seller_phone: { type: DataTypes.STRING, allowNull: true },
  tax_percent: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0 },
  duties_percent: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0 },
  invoice_start_number: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1000 },
  proforma_start_number: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1000 },
  file_number_prefix: { type: DataTypes.STRING(32), allowNull: true, defaultValue: '' },
  file_number_include_customer_id: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  file_number_last_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  sequelize,
  modelName: 'AccountingSettings',
  tableName: 'accounting_settings',
  timestamps: true,
  underscored: true
});

module.exports = AccountingSettings;


