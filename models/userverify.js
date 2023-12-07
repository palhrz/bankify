'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserVerify extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserVerify.init({
    user_id: DataTypes.INTEGER,
    uuid: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserVerify',
  });
  return UserVerify;
};