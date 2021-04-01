'use strict';

const jwt = require('jsonwebtoken');
const { Token } = require("graphql");

module.exports = (sequelize, DataTypes) => {
    const ResetToken = sequelize.define('ResetToken', {
        token: {
            type: DataTypes.STRING
        }
    }, {});
    ResetToken.associate = function (models) {
        ResetToken.belongsTo(models.User, { foreignKey: 'resetUser' });
    }
    ResetToken.prototype.generateJWT = function () {
        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 60);
    
        return jwt.sign({
          id: this.id,
          exp: parseInt(expirationDate.getTime() / 1000, 10),
        }, process.env.APP_SECRET);
      }
    return ResetToken;
}