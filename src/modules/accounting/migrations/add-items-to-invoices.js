const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('invoices', 'items', {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'آیتم‌های فاکتور'
    });
    
    await queryInterface.addColumn('invoices', 'travel_cost', {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('invoices', 'tax_percent', {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('invoices', 'duties_percent', {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('invoices', 'items');
    await queryInterface.removeColumn('invoices', 'travel_cost');
    await queryInterface.removeColumn('invoices', 'tax_percent');
    await queryInterface.removeColumn('invoices', 'duties_percent');
  }
};
