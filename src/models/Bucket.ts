import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface BucketAttributes {
  id: string;
  name: string;
  region: string;
  storageClass: string;
  isPublic: boolean;
  quota?: bigint;
  usedSpace: bigint;
  fileCount: number;
  ownerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BucketCreationAttributes extends Optional<BucketAttributes, 'id' | 'usedSpace' | 'fileCount'> {}

class Bucket extends Model<BucketAttributes, BucketCreationAttributes> implements BucketAttributes {
  public id!: string;
  public name!: string;
  public region!: string;
  public storageClass!: string;
  public isPublic!: boolean;
  public quota?: bigint;
  public usedSpace!: bigint;
  public fileCount!: number;
  public ownerId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Bucket.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    region: {
      type: DataTypes.STRING(50),
      defaultValue: 'us-east-1',
    },
    storageClass: {
      type: DataTypes.STRING(50),
      defaultValue: 'STANDARD',
      field: 'storage_class',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_public',
    },
    quota: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    usedSpace: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      field: 'used_space',
    },
    fileCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'file_count',
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'owner_id',
    },
  },
  {
    sequelize,
    tableName: 'buckets',
    underscored: true,
    timestamps: true,
  }
);

export default Bucket;
