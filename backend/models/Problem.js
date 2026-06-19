const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Problem', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:       { type: DataTypes.STRING(255), allowNull: false },
  difficulty:  { type: DataTypes.ENUM('easy', 'medium', 'hard'), allowNull: false },
  topic:       { type: DataTypes.STRING(100), allowNull: false },
  type:        { type: DataTypes.ENUM('algorithm', 'system-design', 'debugging'), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  constraints: { type: DataTypes.TEXT },
  examples:    { type: DataTypes.JSON },
  testCases:   { type: DataTypes.JSON },
  starterCode: { type: DataTypes.JSON },
  evalPrompt:  { type: DataTypes.TEXT },
  isPublic:    { type: DataTypes.BOOLEAN, defaultValue: true },
  createdBy:   { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName:  'problems',
  createdAt:  'createdAt',
  updatedAt:  false,
});
