'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.Account, { foreignKey: 'account_id' });
    }
  }
  Transaction.init({
    type: { type: DataTypes.STRING, validate: {

      isIn: [['Deposit', 'Withdraw', 'Transfer', 'Payment']]
    }},
    account_no: DataTypes.INTEGER,
    beneficiary_name: DataTypes.INTEGER,
    type: DataTypes.STRING,
    status: DataTypes.STRING,
    reason: DataTypes.STRING,
    reference: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    sender: DataTypes.INTEGER,
    time: {type: DataTypes.DATE, defaultValue: sequelize.fn('NOW') }
    },
    {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};