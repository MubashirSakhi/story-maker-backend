'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define('Vote', {
    votedBy: {
      type: DataTypes.INTEGER,
      unique: 'compositeIndex'
    },
    linkId: {
      type: DataTypes.INTEGER,
      unique: 'compositeIndex'
    }
  }, {});
  Vote.associate = function (models) {
    // associations can be defined here
    Vote.belongsTo(models.User, { foreignKey: 'votedBy', as: 'users', })
    Vote.belongsTo(models.Link, { foreignKey: 'LinkId', as: 'links', })
  };
  return Vote;
};