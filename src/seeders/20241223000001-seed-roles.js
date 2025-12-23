const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [
      {
        id: uuidv4(),
        name: 'Super Admin',
        description: 'Full system access',
        permissions: ['*'],
        user_count: 0,
        created_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Admin',
        description: 'Manage users and buckets',
        permissions: ['buckets.*', 'files.*', 'users.read', 'api-keys.*'],
        user_count: 0,
        created_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Developer',
        description: 'API access only',
        permissions: ['buckets.read', 'files.*', 'api-keys.*'],
        user_count: 0,
        created_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'User',
        description: 'Basic access',
        permissions: ['buckets.read', 'files.read'],
        user_count: 0,
        created_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('roles', roles);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
