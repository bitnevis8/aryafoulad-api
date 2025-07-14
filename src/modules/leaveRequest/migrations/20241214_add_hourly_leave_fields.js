'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('leave_requests', 'start_time', {
      type: Sequelize.TIME,
      allowNull: true,
      after: 'end_date'
    });

    await queryInterface.addColumn('leave_requests', 'end_time', {
      type: Sequelize.TIME,
      allowNull: true,
      after: 'start_time'
    });

    await queryInterface.addColumn('leave_requests', 'is_hourly', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'end_time'
    });

    // تغییر نوع فیلد days_count به DECIMAL
    await queryInterface.changeColumn('leave_requests', 'days_count', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('leave_requests', 'start_time');
    await queryInterface.removeColumn('leave_requests', 'end_time');
    await queryInterface.removeColumn('leave_requests', 'is_hourly');
    
    // برگرداندن نوع فیلد days_count به INTEGER
    await queryInterface.changeColumn('leave_requests', 'days_count', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
}; 