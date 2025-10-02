const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // اضافه کردن فیلدهای جدید برای شرکت
    await queryInterface.addColumn('users', 'economicCode', {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'کد اقتصادی شرکت'
    });
    
    await queryInterface.addColumn('users', 'registrationNumber', {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'شماره ثبت شرکت'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // حذف فیلدهای اضافه شده
    await queryInterface.removeColumn('users', 'economicCode');
    await queryInterface.removeColumn('users', 'registrationNumber');
  }
};
