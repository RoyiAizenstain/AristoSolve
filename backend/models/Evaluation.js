const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Evaluation', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:           { type: DataTypes.INTEGER, allowNull: false },
  problemId:        { type: DataTypes.INTEGER, allowNull: false },
  conversationId:   { type: DataTypes.INTEGER, allowNull: false },
  companyId:        { type: DataTypes.INTEGER, allowNull: false },
  score:            { type: DataTypes.INTEGER },
  feedback:         { type: DataTypes.TEXT },
  thinkingAnalysis: { type: DataTypes.TEXT },
  dimensions:       { type: DataTypes.JSON },
}, {
  tableName: 'evaluations',
  createdAt: 'createdAt',
  updatedAt: false,
});
