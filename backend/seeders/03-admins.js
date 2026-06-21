'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Seed Alice (userId=1) as the super-admin
    const [users] = await queryInterface.sequelize.query(
      "SELECT userId FROM users WHERE userRole = 'admin'"
    );
    if (users.length > 0) {
      await queryInterface.bulkInsert('admins', users.map((u, i) => ({
        userId:       u.userId,
        isSuperAdmin: i === 0,
        createdAt:    new Date(),
        updatedAt:    new Date(),
      })));
    }
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('admins', null, {});
  },
};
