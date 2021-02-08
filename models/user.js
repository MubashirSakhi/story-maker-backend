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
          msg: "Minimum 1 character required in username"
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
      validate: {
        len: {
          args: [3],
          msg: "Minimum 4 characters required in username"
        }
      }
    },
    provider:{
      type:DataTypes.STRING,
      validate:{
        isIn: [['basic', 'facebook', 'google']],
      }
    },
    profileId:{
      type:DataTypes.STRING,
    },
    token:{
      type:DataTypes.STRING,
    }
  }, {});
  User.associate = function (models) {
    // associations can be defined here
    
    User.hasMany(models.Title, { foreignKey: "author" });
    User.hasMany(models.Story, { foreignKey: "contributor" });
    User.hasMany(models.Rating, { foreignKey: "ratedBy" });
  };
  // User.findAllUsers = function(query){
  //   User.findAll({
  //     query
  //   })
  //   .then(userDb => {
  //     if(userDb){
  //       return userDb
  //     }
  //     else{
  //       throw new Error('no user Found');
  //     }
  //   })
  //   .catch(e)
  // }
  User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  }
  return User;
};