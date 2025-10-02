const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../core/database/mysql/connection');

class Service extends Model {}

Service.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  row_no: { type: DataTypes.INTEGER, allowNull: false },
  code: { type: DataTypes.STRING(32), allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  responsible_user_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  sequelize,
  modelName: 'Service',
  tableName: 'accounting_services',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['code'], unique: false },
    { fields: ['responsible_user_id'] }
  ]
});

module.exports = Service;


