const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'signature', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      comment: 'امضای کاربر'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'signature');
  }
};
