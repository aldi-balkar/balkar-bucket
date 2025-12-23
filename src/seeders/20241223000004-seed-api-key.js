const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate a sample API key for testing
    const apiKey = {
      id: uuidv4(),
      name: 'Development API Key',
      key: 'sk_live_dev_12345678901234567890123456789012',
      permissions: ['*'],
      status: 'active',
      rate_limit_enabled: false,
      rate_limit_max: 1000,
      rate_limit_window: 60000,
      total_requests: 0,
      total_uploads: 0,
      storage_used: 0,
      error_count: 0,
      last_used_at: null,
      expires_at: null,
      created_at: new Date(),
    };

    await queryInterface.bulkInsert('api_keys', [apiKey]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('api_keys', null, {});
  },
};
