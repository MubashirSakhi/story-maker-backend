'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
    provider: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['basic', 'facebook', 'google']],
      }
    },
    profileId: {
      type: DataTypes.STRING,
    },
    token: {
      type: DataTypes.STRING,
    }
  }, {});
  User.associate = function (models) {
    // associations can be defined here

    User.hasMany(models.Title, { foreignKey: "author" });
    User.hasMany(models.Story, { foreignKey: "contributor" });
    User.hasMany(models.Rating, { foreignKey: "ratedBy" });
    User.hasOne(models.Token,{foreignKey: 'resetUser'})
  };
  User.upsertFbUser = async function ({ accessToken, refreshToken, profile }) {
    const User = this;

    const user = await User.findOne({
      where: {
        'provider': 'facebook',
        profileId: profile.id
      }
    });

    // no user was found, lets create a new one
    if (!user) {
      const newUser = await User.create({
        provider: "facebook",
        profileId: profile.id,
        email: profile.emails && profile.emails[0] && profile.emails[0].value,
        name: profile.name.givenName,
        token: accessToken
      });

      return newUser;
    }
    return user;
  };
  User.upsertGoogleUser = async function ({ accessToken, refreshToken, profile }) {
    const User = this;

    const user = await User.findOne({
      where: {
        'provider': 'google',
        profileId: profile.id
      }
    });

    // no user was found, lets create a new one
    if (!user) {
      const newUser = await User.create({
        provider: "google",
        profileId: profile.id,
        email: profile.emails && profile.emails[0] && profile.emails[0].value,
        name: profile.name.givenName,
        token: accessToken
      });

      return newUser;
    }
    return user;
  };
  
  User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  }
  User.prototype.generateJWT = function () {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
      id: this.id,
      exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, process.env.APP_SECRET);
  }

  return User;
};