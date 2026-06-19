const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Settings', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:               { type: DataTypes.INTEGER, allowNull: false, unique: true },
  displayName:          { type: DataTypes.STRING(200) },
  email:                { type: DataTypes.STRING(255) },
  theme:                { type: DataTypes.ENUM('dark', 'light'), defaultValue: 'dark' },
  emailNotifications:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'settings',
  timestamps: false,
});
