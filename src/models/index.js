import sequelize from "../config/database.js";

import User from "./User.js";
import Media from "./Media.js";
import UserMediaStatus from "./UserMediaStatus.js";

import Folder from "./Folder.js";
import MediaList from "./MediaList.js";
import ListItem from "./ListItem.js";

User.hasMany(UserMediaStatus, { foreignKey: "user_id" });
UserMediaStatus.belongsTo(User, { foreignKey: "user_id" });

Media.hasMany(UserMediaStatus, { foreignKey: "media_id" });
UserMediaStatus.belongsTo(Media, { foreignKey: "media_id" });

User.hasMany(Folder, { foreignKey: "user_id" });
Folder.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(MediaList, { foreignKey: "user_id" });
MediaList.belongsTo(User, { foreignKey: "user_id" });

Folder.hasMany(MediaList, { foreignKey: "folder_id" });
MediaList.belongsTo(Folder, { foreignKey: "folder_id" });

MediaList.hasMany(ListItem, { foreignKey: "list_id" });
ListItem.belongsTo(MediaList, { foreignKey: "list_id" });

Media.hasMany(ListItem, { foreignKey: "media_id" });
ListItem.belongsTo(Media, { foreignKey: "media_id" });

export {
  sequelize,
  User,
  Media,
  UserMediaStatus,
  Folder,
  MediaList,
  ListItem,
};