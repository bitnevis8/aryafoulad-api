'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // اضافه کردن کلید خارجی برای userId در جدول mission_orders
    await queryInterface.addConstraint('mission_orders', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'mission_orders_userId_fk',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // حذف کلید خارجی
    await queryInterface.removeConstraint('mission_orders', 'mission_orders_userId_fk');
  }
}; 