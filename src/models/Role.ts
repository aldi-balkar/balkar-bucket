import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface RoleAttributes {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  userCount: number;
  createdAt?: Date;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'userCount'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public permissions!: string[];
  public userCount!: number;
  public readonly createdAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    userCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'user_count',
    },
  },
  {
    sequelize,
    tableName: 'roles',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

export default Role;
