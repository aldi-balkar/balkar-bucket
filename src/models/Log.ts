import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface LogAttributes {
  id: string;
  type: string;
  action: string;
  details?: object;
  userId?: string;
  apiKeyId?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
  createdAt?: Date;
}

interface LogCreationAttributes extends Optional<LogAttributes, 'id'> {}

class Log extends Model<LogAttributes, LogCreationAttributes> implements LogAttributes {
  public id!: string;
  public type!: string;
  public action!: string;
  public details?: object;
  public userId?: string;
  public apiKeyId?: string;
  public ipAddress?: string;
  public userAgent?: string;
  public status?: string;
  public readonly createdAt!: Date;
}

Log.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
    },
    apiKeyId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'api_key_id',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_agent',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'logs',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

export default Log;
