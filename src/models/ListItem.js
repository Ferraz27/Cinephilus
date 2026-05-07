import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ListItem = sequelize.define("ListItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  list_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  media_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: "list_items",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
});

export default ListItem;