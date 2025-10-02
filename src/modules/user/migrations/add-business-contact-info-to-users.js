const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // اضافه کردن فیلد businessContactInfo
    await queryInterface.addColumn('users', 'businessContactInfo', {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'اطلاعات تماس کسب و کار'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // حذف فیلد businessContactInfo
    await queryInterface.removeColumn('users', 'businessContactInfo');
  }
};
