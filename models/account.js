'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Account.hasMany(sequelize.define('Transaction'))
    }
  }
  Account.init({
    account_no: { type: Number, defaultValue: Math.floor(Math.random() * 10000000) + 1111111 },
    account_type: DataTypes.STRING,
    balance: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Account',
  });
  return Account;
};