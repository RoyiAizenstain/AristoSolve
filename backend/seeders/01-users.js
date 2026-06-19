'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('users', [
      { firstName: 'Alice', lastName: 'Admin',   email: 'alice@example.com', password: 'admin123',     userRole: 'admin',     level: 'advanced',     createDate: new Date(), updateDate: new Date() },
      { firstName: 'Bob',   lastName: 'Builder', email: 'bob@example.com',   password: 'company123',  userRole: 'company',   level: 'intermediate', createDate: new Date(), updateDate: new Date() },
      { firstName: 'Carol', lastName: 'Chen',    email: 'carol@example.com', password: 'candidate123', userRole: 'candidate', level: 'beginner',     createDate: new Date(), updateDate: new Date() },
      { firstName: 'Dave',  lastName: 'Dev',     email: 'dave@example.com',  password: 'candidate123', userRole: 'candidate', level: 'intermediate', createDate: new Date(), updateDate: new Date() },
      { firstName: 'Eva',   lastName: 'Evans',   email: 'eva@example.com',   password: 'candidate123', userRole: 'candidate', level: 'advanced',     createDate: new Date(), updateDate: new Date() },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
