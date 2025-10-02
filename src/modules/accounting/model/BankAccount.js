const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../core/database/mysql/connection');

class BankAccount extends Model {}

BankAccount.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bank_name: { type: DataTypes.STRING(128), allowNull: true },
  bank_code: { type: DataTypes.STRING(3), allowNull: true, comment: 'کد 3 رقمی بانک' },
  account_number: { type: DataTypes.STRING(64), allowNull: false },
  iban: { type: DataTypes.STRING(34), allowNull: false },
  holder_name: { type: DataTypes.STRING(128), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  sequelize,
  modelName: 'BankAccount',
  tableName: 'accounting_bank_accounts',
  timestamps: true,
  underscored: true,
});

module.exports = BankAccount;



