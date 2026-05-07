import MediaList from "../models/MediaList.js";
import ListItem from "../models/ListItem.js";
import Media from "../models/Media.js";

export async function createMediaList({
  userId,
  folder_id,
  title,
  description,
  is_public,
}) {
  return MediaList.create({
    user_id: userId,
    folder_id,
    title,
    description,
    is_public,
  });
}

export async function getUserLists(userId) {
  return MediaList.findAll({
    where: { user_id: userId },
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

  return list;
}