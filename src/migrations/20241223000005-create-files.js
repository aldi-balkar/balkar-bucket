module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('files', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      bucket_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'buckets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      uploaded_by: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      api_key_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'api_keys',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('files', ['bucket_id']);
    await queryInterface.addIndex('files', ['is_deleted']);
    await queryInterface.addIndex('files', ['api_key_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('files');
  },
};
