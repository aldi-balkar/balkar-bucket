import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface SettingAttributes {
  id: string;
  key: string;
  value: object;
  category?: string;
  updatedAt?: Date;
}

interface SettingCreationAttributes extends Optional<SettingAttributes, 'id'> {}

class Setting extends Model<SettingAttributes, SettingCreationAttributes> implements SettingAttributes {
  public id!: string;
  public key!: string;
  public value!: object;
  public category?: string;
  public readonly updatedAt!: Date;
}

Setting.init(
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
    value: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'settings',
    underscored: true,
    timestamps: true,
    createdAt: false,
  }
);

export default Setting;
