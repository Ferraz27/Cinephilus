import Folder from "../models/Folder.js";
import MediaList from "../models/MediaList.js";
import ListItem from "../models/ListItem.js";
import Media from "../models/Media.js";
import MediaListLike from "../models/MediaListLike.js";
import MediaListComment from "../models/MediaListComment.js";
import User from "../models/User.js";

export async function createMediaList({
  userId,
  folder_id,
  title,
  description,
  is_public,
  allow_comments,
}) {
  if (folder_id) {
    const folder = await Folder.findOne({
      where: {
        id: folder_id,
        user_id: userId,
      },
    });

    if (!folder) {
      throw new Error("Pasta não encontrada");
    }
  }

  return MediaList.create({
    user_id: userId,
    folder_id,
    title,
    description,
    is_public,
    allow_comments: allow_comments !== false,
  });
}

export async function getUserLists(userId) {
  return MediaList.findAll({
    where: { user_id: userId },
    include: [
      Folder,
      {
        model: ListItem,
        include: [Media],
      },
    ],
    order: [["created_at", "DESC"]],
  });
}

export async function getListById({ userId, listId }) {
  const list = await MediaList.findOne({
    where: {
      id: listId,
      user_id: userId,
    },
    include: [
      Folder,
      {
        model: ListItem,
        include: [Media],
      },
    ],
    order: [[ListItem, "position", "ASC"]],
  });

  if (!list) {
    throw new Error("Lista não encontrada");
  }

  const [likesCount, commentsCount] = await Promise.all([
    MediaListLike.count({ where: { list_id: list.id } }),
    MediaListComment.count({ where: { list_id: list.id } }),
  ]);

  return {
    ...list.toJSON(),
    likesCount,
    commentsCount,
  };
}

export async function updateMediaList({
  userId,
  listId,
  title,
  description,
  is_public,
  folder_id,
  allow_comments,
}) {
  const list = await MediaList.findOne({
    where: {
      id: listId,
      user_id: userId,
    },
  });

  if (!list) {
    throw new Error("Lista não encontrada");
  }

  if (folder_id !== undefined) {
    if (folder_id === null) {
      list.folder_id = null;
    } else {
      const folder = await Folder.findOne({
        where: {
          id: folder_id,
          user_id: userId,
        },
      });

      if (!folder) {
        throw new Error("Pasta não encontrada");
      }

      list.folder_id = folder_id;
    }
  }

  if (title !== undefined) {
    list.title = title;
  }

  if (description !== undefined) {
    list.description = description;
  }

  if (is_public !== undefined) {
    list.is_public = is_public;
  }

  if (allow_comments !== undefined) {
    list.allow_comments = allow_comments;
  }

  await list.save();

  return list;
}

export async function getListCommentsByOwner({ userId, listId }) {
  const list = await MediaList.findOne({
    where: {
      id: listId,
      user_id: userId,
    },
  });

  if (!list) {
    throw new Error("Lista não encontrada");
  }

  return MediaListComment.findAll({
    where: {
      list_id: list.id,
    },
    include: [
      {
        model: User,
        attributes: ["id", "username", "name", "avatar_url"],
      },
    ],
    order: [["created_at", "ASC"]],
  });
}

export async function createListCommentByOwner({
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

  const list = await MediaList.findOne({
    where: {
      id: listId,
      user_id: userId,
    },
  });

  if (!list) {
    throw new Error("Lista não encontrada");
  }

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