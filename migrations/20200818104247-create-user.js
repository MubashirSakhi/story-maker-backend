'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          len: {
            args: [1],
            msg: "Minimum 4 characters required in username"
          }
        }
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING,
        validate: {
          len: {
            args: [3],
            msg: "Minimum 4 characters required in username"
          }
        }
      },
      provider:{
        type:Sequelize.STRING,
        validate:{
          isIn: [['basic', 'facebook', 'google']],
        }
      },
      profileId:{
        type:Sequelize.STRING,
      },
      token:{
        type:Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};