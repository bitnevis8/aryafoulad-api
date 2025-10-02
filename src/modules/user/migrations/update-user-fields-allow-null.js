const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // تغییر firstName و lastName به allowNull: true
    await queryInterface.changeColumn('users', 'firstName', {
      type: DataTypes.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('users', 'lastName', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // برگرداندن تغییرات
    await queryInterface.changeColumn('users', 'firstName', {
      type: DataTypes.STRING,
      allowNull: false,
    });
    
    await queryInterface.changeColumn('users', 'lastName', {
      type: DataTypes.STRING,
      allowNull: false,
    });
  }
};
