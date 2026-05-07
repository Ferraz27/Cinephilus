import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Media = sequelize.define("Media", {

  tmdb_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  unique: true,
  },
  
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  original_title: {
    type: DataTypes.STRING,
  },

  type: {
    type: DataTypes.ENUM("MOVIE", "SERIES", "ANIME"),
    allowNull: false,
  },

  synopsis: {
    type: DataTypes.TEXT,
  },

  poster_url: {
    type: DataTypes.STRING,
  },

  release_date: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: "media",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

export default Media;