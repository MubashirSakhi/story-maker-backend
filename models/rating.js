'use strict';
module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "Minimum 1 star is required for ratings."
        },
        max: {
          args: [5],
          msg: "Maximum 5 stars are allowed for ratings."
        }
      }
    },
    comment: DataTypes.STRING
  }, {});
  Rating.associate = function (models) {
    // associations can be defined here
    Rating.belongsTo(models.User, { foreignKey: "ratedBy" })
    Rating.belongsTo(models.Story, { foreignKey: "storyId" })
  };
  return Rating;
};