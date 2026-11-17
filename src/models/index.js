import sequelize from "../config/database.js";

import User from "./User.js";
import Media from "./Media.js";
import UserMediaStatus from "./UserMediaStatus.js";
import UserFavoriteMedia from "./UserFavoriteMedia.js";
import MediaReview from "./MediaReview.js";
import MediaReviewVote from "./MediaReviewVote.js";
import MediaReviewComment from "./MediaReviewComment.js";

import Folder from "./Folder.js";
import MediaList from "./MediaList.js";
import ListItem from "./ListItem.js";
import MediaListLike from "./MediaListLike.js";
import MediaListComment from "./MediaListComment.js";

User.hasMany(UserMediaStatus, { foreignKey: "user_id" });
UserMediaStatus.belongsTo(User, { foreignKey: "user_id" });

Media.hasMany(UserMediaStatus, { foreignKey: "media_id" });
UserMediaStatus.belongsTo(Media, { foreignKey: "media_id" });

User.hasMany(MediaReview, { foreignKey: "user_id" });
MediaReview.belongsTo(User, { foreignKey: "user_id" });

Media.hasMany(MediaReview, { foreignKey: "media_id" });
MediaReview.belongsTo(Media, { foreignKey: "media_id" });

User.hasMany(MediaReviewVote, { foreignKey: "user_id" });
MediaReviewVote.belongsTo(User, { foreignKey: "user_id" });

MediaReview.hasMany(MediaReviewVote, { foreignKey: "review_id" });
MediaReviewVote.belongsTo(MediaReview, { foreignKey: "review_id" });

User.hasMany(MediaReviewComment, { foreignKey: "user_id" });
MediaReviewComment.belongsTo(User, { foreignKey: "user_id" });

MediaReview.hasMany(MediaReviewComment, { foreignKey: "review_id" });
MediaReviewComment.belongsTo(MediaReview, { foreignKey: "review_id" });

MediaReviewComment.hasMany(MediaReviewComment, {
  foreignKey: "parent_comment_id",
  as: "Replies",
});
MediaReviewComment.belongsTo(MediaReviewComment, {
  foreignKey: "parent_comment_id",
  as: "ParentComment",
});

User.hasMany(Folder, { foreignKey: "user_id" });
Folder.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(MediaList, { foreignKey: "user_id" });
MediaList.belongsTo(User, { foreignKey: "user_id" });

Folder.hasMany(MediaList, { foreignKey: "folder_id" });
MediaList.belongsTo(Folder, { foreignKey: "folder_id" });

User.hasMany(MediaListLike, { foreignKey: "user_id" });
MediaListLike.belongsTo(User, { foreignKey: "user_id" });

MediaList.hasMany(MediaListLike, { foreignKey: "list_id" });
MediaListLike.belongsTo(MediaList, { foreignKey: "list_id" });

User.hasMany(MediaListComment, { foreignKey: "user_id" });
MediaListComment.belongsTo(User, { foreignKey: "user_id" });

MediaList.hasMany(MediaListComment, { foreignKey: "list_id" });
MediaListComment.belongsTo(MediaList, { foreignKey: "list_id" });

MediaListComment.hasMany(MediaListComment, {
  foreignKey: "parent_comment_id",
  as: "Replies",
});
MediaListComment.belongsTo(MediaListComment, {
  foreignKey: "parent_comment_id",
  as: "ParentComment",
});

MediaList.hasMany(ListItem, { foreignKey: "list_id" });
ListItem.belongsTo(MediaList, { foreignKey: "list_id" });

Media.hasMany(ListItem, { foreignKey: "media_id" });
ListItem.belongsTo(Media, { foreignKey: "media_id" });

User.hasMany(UserFavoriteMedia, { foreignKey: "user_id" });
UserFavoriteMedia.belongsTo(User, { foreignKey: "user_id" });

Media.hasMany(UserFavoriteMedia, { foreignKey: "media_id" });
UserFavoriteMedia.belongsTo(Media, { foreignKey: "media_id" });

export {
  sequelize,
  User,
  Media,
  UserMediaStatus,
  UserFavoriteMedia,
  MediaReview,
  MediaReviewVote,
  MediaReviewComment,
  Folder,
  MediaList,
  ListItem,
  MediaListLike,
  MediaListComment,
};