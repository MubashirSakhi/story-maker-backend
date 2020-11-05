'use strict';
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1],
          msg: "Minimum 2 characters required in username"
        }
      }
    },


    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3],
          msg: "Minimum 4 characters required in username"
        }
      }
    }
  }, {});
  User.associate = function (models) {
    // associations can be defined here
    
    User.hasMany(models.Title, { foreignKey: "author" });
    User.hasMany(models.Story, { foreignKey: "contributor" });
    User.hasMany(models.Rating, { foreignKey: "ratedBy" });
  };
  User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  }
  return User;
};