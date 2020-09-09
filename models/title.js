'use strict';
module.exports = (sequelize, DataTypes) => {
  const Title = sequelize.define('Title', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: "Minimum 4 characters required in bowlingtype"
        }
      }
    },
    background: DataTypes.TEXT
  }, {});
  Title.associate = function (models) {
    // associations can be defined here
    Title.belongsTo(models.User, { foreignKey: "author" });
    Title.hasMany(models.Story,{foreignKey:"titleId"})
  };
  return Title;
};