import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MediaList = sequelize.define("MediaList", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  folder_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
  },

  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  allow_comments: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: "media_lists",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

export default MediaList;