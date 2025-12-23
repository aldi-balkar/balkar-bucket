module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('buckets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      region: {
        type: Sequelize.STRING(50),
        defaultValue: 'us-east-1',
      },
      storage_class: {
        type: Sequelize.STRING(50),
        defaultValue: 'STANDARD',
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      quota: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      used_space: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      file_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('buckets', ['name']);
    await queryInterface.addIndex('buckets', ['owner_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('buckets');
  },
};
