'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Account.hasMany(models.Transaction, { foreignKey: 'account_id' });
      Account.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Account.init({
    account_name: DataTypes.STRING,
    account_no: { type: Number, defaultValue: function() {
      return Math.floor(Math.random() * 10000000) + 1111111;
    }, unique: true, // Ensure uniqueness
  },
    account_type: DataTypes.STRING,
    balance: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Account',
  });
  return Account;
};