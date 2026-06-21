const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Admin', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:       { type: DataTypes.INTEGER, allowNull: false, unique: true },
  isSuperAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'admins',
});
