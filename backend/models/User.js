const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('User', {
  userId:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING(100), allowNull: false },
  lastName:  { type: DataTypes.STRING(100), allowNull: false },
  email:     { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password:  { type: DataTypes.STRING(255), allowNull: false },
  userRole:  { type: DataTypes.ENUM('admin', 'company', 'candidate'), allowNull: false },
  level:     { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'beginner' },
}, {
  tableName:  'users',
  createdAt:  'createDate',
  updatedAt:  'updateDate',
});
