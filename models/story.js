'use strict';
module.exports = (sequelize, DataTypes) => {
  const Story = sequelize.define('Story', {
    story: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {});
  Story.associate = function (models) {
    // associations can be defined here
    Story.belongsTo(models.User, { foreignKey: "contributor" });
    Story.belongsTo(models.Title, { foreignKey: "titleId" });
    Story.hasMany(models.Rating, { foreignKey: "storyId" });
  };
  return Story;
};