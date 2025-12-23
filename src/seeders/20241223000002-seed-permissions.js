const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const permissions = [
      { id: uuidv4(), key: 'buckets.create', name: 'Create Bucket', category: 'Buckets', description: 'Create new buckets' },
      { id: uuidv4(), key: 'buckets.read', name: 'Read Bucket', category: 'Buckets', description: 'View bucket details' },
      { id: uuidv4(), key: 'buckets.update', name: 'Update Bucket', category: 'Buckets', description: 'Modify bucket settings' },
      { id: uuidv4(), key: 'buckets.delete', name: 'Delete Bucket', category: 'Buckets', description: 'Remove buckets' },
      
      { id: uuidv4(), key: 'files.upload', name: 'Upload File', category: 'Files', description: 'Upload files to buckets' },
      { id: uuidv4(), key: 'files.read', name: 'Read File', category: 'Files', description: 'View and download files' },
      { id: uuidv4(), key: 'files.delete', name: 'Delete File', category: 'Files', description: 'Remove files' },
      
      { id: uuidv4(), key: 'api-keys.create', name: 'Create API Key', category: 'API Keys', description: 'Generate new API keys' },
      { id: uuidv4(), key: 'api-keys.read', name: 'Read API Key', category: 'API Keys', description: 'View API key details' },
      { id: uuidv4(), key: 'api-keys.revoke', name: 'Revoke API Key', category: 'API Keys', description: 'Disable API keys' },
      
      { id: uuidv4(), key: 'users.create', name: 'Create User', category: 'Users', description: 'Add new users' },
      { id: uuidv4(), key: 'users.read', name: 'Read User', category: 'Users', description: 'View user information' },
      { id: uuidv4(), key: 'users.update', name: 'Update User', category: 'Users', description: 'Modify user details' },
      { id: uuidv4(), key: 'users.delete', name: 'Delete User', category: 'Users', description: 'Remove users' },
      
      { id: uuidv4(), key: 'settings.update', name: 'Update Settings', category: 'Settings', description: 'Modify system settings' },
    ];

    await queryInterface.bulkInsert('permissions', permissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};
