import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface PermissionAttributes {
  id: string;
  key: string;
  name: string;
  category: string;
  description?: string;
}

interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id'> {}

class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  public id!: string;
  public key!: string;
  public name!: string;
  public category!: string;
  public description?: string;
}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'permissions',
    underscored: true,
    timestamps: false,
  }
);

export default Permission;
