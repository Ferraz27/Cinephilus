import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MediaListComment = sequelize.define("MediaListComment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  list_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  parent_comment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: "media_list_comments",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

export default MediaListComment;