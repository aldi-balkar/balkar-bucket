import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface FileAttributes {
  id: string;
  filename: string;
  originalName: string;
  bucketId: string;
  size: bigint;
  mimeType: string;
  filePath: string;
  url?: string;
  metadata?: object;
  uploadedBy?: string;
  apiKeyId?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
}

interface FileCreationAttributes extends Optional<FileAttributes, 'id' | 'isDeleted'> {}

class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  public id!: string;
  public filename!: string;
  public originalName!: string;
  public bucketId!: string;
  public size!: bigint;
  public mimeType!: string;
  public filePath!: string;
  public url?: string;
  public metadata?: object;
  public uploadedBy?: string;
  public apiKeyId?: string;
  public isDeleted!: boolean;
  public deletedAt?: Date;
  public readonly createdAt!: Date;
}

File.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'original_name',
    },
    bucketId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'bucket_id',
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'mime_type',
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_path',
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    uploadedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'uploaded_by',
    },
    apiKeyId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'api_key_id',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted',
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'files',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

export default File;
