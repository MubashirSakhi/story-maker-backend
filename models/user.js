'use strict';
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  User.associate = function (models) {
    // associations can be defined here
    //User.hasMany(models.Recipe);
    User.hasMany(models.Link, { foreignKey: "postedBy" });
    User.hasMany(models.Vote, { foreignKey: 'votedBy' });
    User.hasMany(models.Title, { foreignKey: "author" });
    User.hasMany(models.Story, { foreignKey: "contributor" });
    User.hasMany(modes.Rating, { foreignKey: "reporter" });
  };
  User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  }
  return User;
};