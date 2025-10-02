'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('invoices', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'توضیحات فاکتور'
    });

    await queryInterface.addColumn('invoices', 'selected_account_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'شناسه حساب بانکی انتخاب شده'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('invoices', 'description');
    await queryInterface.removeColumn('invoices', 'selected_account_id');
  }
};
