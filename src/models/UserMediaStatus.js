import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserMediaStatus = sequelize.define("UserMediaStatus", {
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

  status: {
    type: DataTypes.ENUM("PLANNED", "WATCHING", "COMPLETED", "DROPPED"),
    allowNull: false,
  },

  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "user_media_status",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",

  indexes: [
    {
      unique: true,
      fields: ["user_id", "media_id"],
    },
  ],
});

export default UserMediaStatus;