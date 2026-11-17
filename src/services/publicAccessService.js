import User from "../models/User.js";
import { Op } from "sequelize";
import Folder from "../models/Folder.js";
import MediaList from "../models/MediaList.js";
import ListItem from "../models/ListItem.js";
import Media from "../models/Media.js";
import MediaListLike from "../models/MediaListLike.js";
import MediaListComment from "../models/MediaListComment.js";
import UserMediaStatus from "../models/UserMediaStatus.js";
import MediaReview from "../models/MediaReview.js";
import { getFavorites } from "./userFavoriteService.js";

function publicListInclude() {
  return [
    {
      model: ListItem,
      include: [Media],
    },
  ];
}

async function findPublicUser(username) {
  const user = await User.findOne({
    where: {
      username,
      is_active: true,
    },
  });

  if (!user || user.is_private) {
    throw new Error("Perfil não encontrado");
  }

  return user;
}

  async function findPublicListById(listId) {
    const list = await MediaList.findOne({
      where: {
        id: listId,
        is_public: true,
      },
      include: [Folder, ...publicListInclude()],
    });

    if (!list) {
      throw new Error("Lista não encontrada");
    }

    return list;
  }

  async function getRecentWatched(userId) {
    return UserMediaStatus.findAll({
      where: {
        user_id: userId,
        status: "COMPLETED",
      },
      include: [
        {
          model: Media,
          attributes: ["id", "tmdb_id", "title", "original_title", "type", "poster_url", "release_date"],
        },
      ],
      order: [["updated_at", "DESC"]],
      limit: 6,
    });
  }

  async function getRecentReviews(userId) {
    return MediaReview.findAll({
      where: {
        user_id: userId,
      },
      attributes: {
        include: [
          [
            MediaReview.sequelize.literal(
              '(SELECT rating FROM user_media_status WHERE user_id = "MediaReview"."user_id" AND media_id = "MediaReview"."media_id" AND season_number = "MediaReview"."season_number" LIMIT 1)'
            ),
            "rating",
          ],
        ],
      },
      include: [
        {
          model: Media,
          attributes: ["id", "tmdb_id", "title", "original_title", "type", "poster_url", "release_date"],
        },
      ],
      order: [["updated_at", "DESC"]],
      limit: 6,
    });
  }

export async function getPublicProfile(username) {
  const user = await findPublicUser(username);

  const [publicFolders, publicLists, folderCount, listCount, recentWatched, recentReviews, favorites, watchedCount, reviewsCount] = await Promise.all([
    Folder.findAll({
      where: {
        user_id: user.id,
        is_public: true,
      },
      include: [
        {
          model: MediaList,
          where: {
            is_public: true,
          },
          required: false,
          include: publicListInclude(),
        },
      ],
      order: [["created_at", "DESC"]],
    }),
    MediaList.findAll({
      where: {
        user_id: user.id,
        is_public: true,
        folder_id: null,
      },
      include: publicListInclude(),
      order: [["created_at", "DESC"]],
    }),
    Folder.count({
      where: {
        user_id: user.id,
        is_public: true,
      },
    }),
    MediaList.count({
      where: {
        user_id: user.id,
        is_public: true,
      },
    }),
    getRecentWatched(user.id),
    getRecentReviews(user.id),
    getFavorites(user.id),
    UserMediaStatus.count({ where: { user_id: user.id, status: "COMPLETED" } }),
    MediaReview.count({ where: { user_id: user.id } }),
  ]);

  return {
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar_url: user.avatar_url,
      bio: user.bio,
    },
    stats: {
      folders: folderCount,
      lists: listCount,
      watched: watchedCount,
      reviews: reviewsCount,
    },
    folders: publicFolders,
    lists: publicLists,
    recentWatched,
    recentReviews,
    favorites,
  };
}

export async function getPublicFolder(username, folderId) {
  const user = await findPublicUser(username);

  const folder = await Folder.findOne({
    where: {
      id: folderId,
      user_id: user.id,
      is_public: true,
    },
    include: [
      {
        model: MediaList,
        where: {
          is_public: true,
        },
        required: false,
        include: publicListInclude(),
      },
    ],
  });

  if (!folder) {
    throw new Error("Pasta não encontrada");
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar_url: user.avatar_url,
      bio: user.bio,
    },
    folder,
  };
}

export async function getPublicList(username, listId, currentUserId = null) {
  const user = await findPublicUser(username);

    const list = await MediaList.findOne({
    where: {
      id: listId,
      user_id: user.id,
      is_public: true,
    },
    include: [
        {
          model: Folder,
          required: false,
          where: {
            is_public: true,
          },
        },
      ...publicListInclude(),
    ],
  });

  if (!list) {
    throw new Error("Lista não encontrada");
  }

  const [likesCount, commentsCount, likedByMe] = await Promise.all([
    MediaListLike.count({ where: { list_id: list.id } }),
    MediaListComment.count({ where: { list_id: list.id } }),
    currentUserId
      ? MediaListLike.findOne({ where: { list_id: list.id, user_id: currentUserId } })
      : null,
  ]);

  return {
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar_url: user.avatar_url,
      bio: user.bio,
    },
    list,
    likesCount,
    commentsCount,
    likedByMe: Boolean(likedByMe),
  };
}

export async function getListComments(listId) {
  await findPublicListById(listId);

  const comments = await MediaListComment.findAll({
    where: { list_id: listId },
    include: [
      {
        model: User,
        attributes: ["id", "username", "name", "avatar_url"],
      },
    ],
    order: [["created_at", "ASC"]],
  });

  return comments;
}

export async function toggleListLike({ userId, listId }) {
  const list = await findPublicListById(listId);

  const existingLike = await MediaListLike.findOne({
    where: {
      user_id: userId,
      list_id: list.id,
    },
  });

  if (existingLike) {
    await existingLike.destroy();
  } else {
    await MediaListLike.create({
      user_id: userId,
      list_id: list.id,
    });
  }

  const likesCount = await MediaListLike.count({ where: { list_id: list.id } });

  return {
    liked: !existingLike,
    likesCount,
  };
}

export async function createListComment({
  userId,
  listId,
  content,
  parent_comment_id,
}) {
  const cleanContent = String(content || "").trim();

  if (!cleanContent) {
    throw new Error("Comentário é obrigatório");
  }

  if (cleanContent.length > 1000) {
    throw new Error("Comentário muito longo");
  }

  const list = await findPublicListById(listId);

  if (list.allow_comments === false) {
    throw new Error("Esta lista nao permite comentarios");
  }

  if (parent_comment_id) {
    const parent = await MediaListComment.findByPk(parent_comment_id);

    if (!parent || parent.list_id !== list.id) {
      throw new Error("Comentario pai invalido");
    }
  }

  const comment = await MediaListComment.create({
    user_id: userId,
    list_id: list.id,
    parent_comment_id: parent_comment_id || null,
    content: cleanContent,
  });

  return MediaListComment.findByPk(comment.id, {
    include: [
      {
        model: User,
        attributes: ["id", "username", "name", "avatar_url"],
      },
    ],
  });
}

export async function getPublicUserWatched(username) {
  const user = await findPublicUser(username);

  const watched = await UserMediaStatus.findAll({
    where: { user_id: user.id, status: "COMPLETED" },
    include: [
      {
        model: Media,
        attributes: ["id", "tmdb_id", "title", "original_title", "type", "poster_url", "release_date"],
      },
    ],
    order: [["updated_at", "DESC"]],
  });

  return {
    user: { id: user.id, username: user.username, name: user.name, avatar_url: user.avatar_url },
    watched,
  };
}

export async function getPublicUserReviews(username) {
  const user = await findPublicUser(username);

  const reviews = await MediaReview.findAll({
    where: { user_id: user.id },
    attributes: {
      include: [
        [
          MediaReview.sequelize.literal(
            '(SELECT rating FROM user_media_status WHERE user_id = "MediaReview"."user_id" AND media_id = "MediaReview"."media_id" AND season_number = "MediaReview"."season_number" LIMIT 1)'
          ),
          "rating",
        ],
      ],
    },
    include: [
      {
        model: Media,
        attributes: ["id", "tmdb_id", "title", "original_title", "type", "poster_url", "release_date"],
      },
    ],
    order: [["updated_at", "DESC"]],
  });

  return {
    user: { id: user.id, username: user.username, name: user.name, avatar_url: user.avatar_url },
    reviews,
  };
}

export async function searchPublicUsers(q) {
  const query = String(q || "").trim();

  if (!query) {
    return [];
  }

  const users = await User.findAll({
    where: {
      is_active: true,
      is_private: false,
      // Sequelize 'or' for username or name contains
      [Op.or]: [
        { username: { [Op.iLike]: `%${query}%` } },
        { name: { [Op.iLike]: `%${query}%` } },
      ],
    },
    attributes: ["id", "username", "name", "avatar_url", "bio"],
    limit: 30,
  });

  return users;
}