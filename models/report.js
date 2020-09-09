'use strict';
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    comment: DataTypes.TEXT,
    type: {
      type: DataTypes.ENUM('title', 'story', 'rating'),
      allowNull: false
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  }, {});
  Report.associate = function (models) {
    // associations can be defined here
  };
  return Report;
};