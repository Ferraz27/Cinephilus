import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MediaReview = sequelize.define("MediaReview", {
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

  season_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Sem titulo",
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: "media_reviews",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",

  indexes: [
    {
      unique: true,
      fields: ["user_id", "media_id", "season_number"],
    },
  ],
});

export default MediaReview;
