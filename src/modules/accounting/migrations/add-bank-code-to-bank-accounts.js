'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('accounting_bank_accounts', 'bank_code', {
      type: Sequelize.STRING(3),
      allowNull: true,
      comment: 'کد 3 رقمی بانک'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('accounting_bank_accounts', 'bank_code');
  }
};
