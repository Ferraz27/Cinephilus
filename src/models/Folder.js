import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Folder = sequelize.define("Folder", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: "folders",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

export default Folder;