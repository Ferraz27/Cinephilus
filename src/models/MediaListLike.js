import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MediaListLike = sequelize.define("MediaListLike", {
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
}, {
  tableName: "media_list_likes",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",

  indexes: [
    {
      unique: true,
      fields: ["user_id", "list_id"],
    },
  ],
});

export default MediaListLike;