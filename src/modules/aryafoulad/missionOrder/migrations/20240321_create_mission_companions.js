'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mission_companions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      missionOrderId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'mission_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // اضافه کردن ایندکس‌های ترکیبی
    await queryInterface.addIndex('mission_companions', ['missionOrderId', 'userId'], {
      unique: true,
      name: 'mission_companions_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('mission_companions');
  }
}; 