import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface ApiKeyAttributes {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: string;
  rateLimitEnabled: boolean;
  rateLimitMax: number;
  rateLimitWindow: number;
  totalRequests: bigint;
  totalUploads: bigint;
  storageUsed: bigint;
  errorCount: number;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt?: Date;
}

interface ApiKeyCreationAttributes extends Optional<ApiKeyAttributes, 'id' | 'totalRequests' | 'totalUploads' | 'storageUsed' | 'errorCount'> {}

class ApiKey extends Model<ApiKeyAttributes, ApiKeyCreationAttributes> implements ApiKeyAttributes {
  public id!: string;
  public name!: string;
  public key!: string;
  public permissions!: string[];
  public status!: string;
  public rateLimitEnabled!: boolean;
  public rateLimitMax!: number;
  public rateLimitWindow!: number;
  public totalRequests!: bigint;
  public totalUploads!: bigint;
  public storageUsed!: bigint;
  public errorCount!: number;
  public lastUsedAt?: Date;
  public expiresAt?: Date;
  public readonly createdAt!: Date;
}

ApiKey.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'revoked', 'expired']],
      },
    },
    rateLimitEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'rate_limit_enabled',
    },
    rateLimitMax: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
      field: 'rate_limit_max',
    },
    rateLimitWindow: {
      type: DataTypes.INTEGER,
      defaultValue: 60000,
      field: 'rate_limit_window',
    },
    totalRequests: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      field: 'total_requests',
    },
    totalUploads: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      field: 'total_uploads',
    },
    storageUsed: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      field: 'storage_used',
    },
    errorCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'error_count',
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_used_at',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at',
    },
  },
  {
    sequelize,
    tableName: 'api_keys',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

export default ApiKey;
