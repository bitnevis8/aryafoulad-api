const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // اضافه کردن فیلد businessName
    await queryInterface.addColumn('users', 'businessName', {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'نام کسب و کار'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // حذف فیلد businessName
    await queryInterface.removeColumn('users', 'businessName');
  }
};
