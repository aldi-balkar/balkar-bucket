const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const settings = [
      {
        id: uuidv4(),
        key: 'app_name',
        value: JSON.stringify({ name: 'Balkar Bucket' }),
        category: 'appearance',
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        key: 'app_logo',
        value: JSON.stringify({ url: '' }),
        category: 'appearance',
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        key: 'app_color',
        value: JSON.stringify({ primary: '#f97316' }),
        category: 'appearance',
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        key: 'alerts',
        value: JSON.stringify({
          upload_success: true,
          upload_error: true,
          storage_warning: true,
        }),
        category: 'notifications',
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        key: 'webhooks',
        value: JSON.stringify({
          enabled: false,
          url: '',
          secret: '',
        }),
        category: 'integration',
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('settings', settings);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('settings', null, {});
  },
};
