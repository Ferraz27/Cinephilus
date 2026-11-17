import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserFavoriteMedia = sequelize.define("UserFavoriteMedia", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  media_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "user_favorite_media",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
});

export default UserFavoriteMedia;
