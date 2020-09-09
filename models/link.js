'use strict';
module.exports = (sequelize, DataTypes) => {
  const Link = sequelize.define('Link', {
    description: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false }
  }, {});
  Link.associate = function (models) {
    // associations can be defined here
    Link.belongsTo(models.User, { foreignKey: 'postedBy', as: 'users', })
    Link.hasMany(models.Vote, { foreignKey: 'linkId' })
  };
  return Link;
};