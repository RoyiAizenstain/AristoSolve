require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../config/database').development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host:    config.host,
    port:    config.port,
    dialect: config.dialect,
    logging: config.logging,
  }
);

const User         = require('./User')(sequelize);
const Problem      = require('./Problem')(sequelize);
const Conversation = require('./Conversation')(sequelize);
const Message      = require('./Message')(sequelize);
const Progress     = require('./Progress')(sequelize);
const Evaluation   = require('./Evaluation')(sequelize);
const Settings     = require('./Settings')(sequelize);

// one-to-many: User → Conversations
User.hasMany(Conversation,  { foreignKey: 'userId' });
Conversation.belongsTo(User, { foreignKey: 'userId' });

// one-to-many: Problem → Conversations
Problem.hasMany(Conversation,  { foreignKey: 'problemId' });
Conversation.belongsTo(Problem, { foreignKey: 'problemId' });

// one-to-many: Conversation → Messages
Conversation.hasMany(Message,  { foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

// many-to-many: User ↔ Problem via Progress (junction table)
User.belongsToMany(Problem, { through: Progress, foreignKey: 'userId' });
Problem.belongsToMany(User, { through: Progress, foreignKey: 'problemId' });

// one-to-many: User → Progress
User.hasMany(Progress,  { foreignKey: 'userId' });
Progress.belongsTo(User, { foreignKey: 'userId' });

// one-to-many: Problem → Progress
Problem.hasMany(Progress,  { foreignKey: 'problemId' });
Progress.belongsTo(Problem, { foreignKey: 'problemId' });

// one-to-many: User → Evaluations
User.hasMany(Evaluation,  { foreignKey: 'userId' });
Evaluation.belongsTo(User, { foreignKey: 'userId' });

// one-to-one: User → Settings
User.hasOne(Settings,  { foreignKey: 'userId' });
Settings.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Problem, Conversation, Message, Progress, Evaluation, Settings };
