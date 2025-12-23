module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('api_keys', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      permissions: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: [],
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'active',
      },
      rate_limit_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      rate_limit_max: {
        type: Sequelize.INTEGER,
        defaultValue: 1000,
      },
      rate_limit_window: {
        type: Sequelize.INTEGER,
        defaultValue: 60000,
      },
      total_requests: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      total_uploads: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      storage_used: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      error_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('api_keys', ['key']);
    await queryInterface.addIndex('api_keys', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('api_keys');
  },
};
