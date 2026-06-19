const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Progress', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:        { type: DataTypes.INTEGER, allowNull: false },
  problemId:     { type: DataTypes.INTEGER, allowNull: false },
  status:        { type: DataTypes.ENUM('in_progress', 'completed'), defaultValue: 'in_progress' },
  attempts:      { type: DataTypes.INTEGER, defaultValue: 1 },
  lastAttemptAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deadline:      { type: DataTypes.DATE, allowNull: true },
}, {
  tableName:  'progress',
  timestamps: false,
});
