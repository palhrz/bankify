'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account_name: {
        type: Sequelize.STRING
      },
      account_no: {
        type: Sequelize.INTEGER,
        defaultValue: function () {
          return Math.floor(Math.random() * 10000000) + 1111111;
        }
      },
      account_type: {
        type: Sequelize.STRING,
        enum: ['Check', 'Savings', 'Business'],
        defaultValue: 'Savings'
      },
      balance: {
        type: Sequelize.INTEGER,
        defaultValue: 0.00
      },
      user_id: {
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
    await queryInterface.dropTable('Accounts');
  }
};