'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.s
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      acc_number: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER
      },
      time: {
        type: Sequelize.DATE
      },
      account_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};