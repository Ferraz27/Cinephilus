import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MediaReviewVote = sequelize.define("MediaReviewVote", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  review_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "media_review_votes",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",

  indexes: [
    {
      unique: true,
      fields: ["user_id", "review_id"],
    },
  ],
});

export default MediaReviewVote;
