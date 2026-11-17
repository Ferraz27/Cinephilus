import Folder from "../models/Folder.js";
import MediaList from "../models/MediaList.js";
import ListItem from "../models/ListItem.js";
import Media from "../models/Media.js";

export async function createFolder({ userId, title, description, is_public }) {
  if (!title || !title.trim()) {
    throw new Error("Título da pasta é obrigatório");
  }

  return Folder.create({
    user_id: userId,
    title: title.trim(),
    description,
    is_public: is_public !== undefined ? Boolean(is_public) : true,
  });
}

export async function getUserFolders(userId) {
  return Folder.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
  });
}

export async function getFolderLists({ userId, folderId }) {
  const folder = await Folder.findOne({
    where: {
      id: folderId,
      user_id: userId,
    },
    include: [
      {
        model: MediaList,
        include: [
          {
            model: ListItem,
            include: [Media],
          },
        ],
      },
    ],
  });

  if (!folder) {
    throw new Error("Pasta não encontrada");
  }

  return folder;
}

export async function updateFolder({ userId, folderId, title, description, is_public }) {
  const folder = await Folder.findOne({
    where: {
      id: folderId,
      user_id: userId,
    },
  });

  if (!folder) {
    throw new Error("Pasta não encontrada");
  }

  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new Error("Título da pasta é obrigatório");
    }

    folder.title = title.trim();
  }

  if (description !== undefined) {
    folder.description = description;
  }

  if (is_public !== undefined) {
    folder.is_public = Boolean(is_public);
  }

  await folder.save();

  return folder;
}

export async function deleteFolder({ userId, folderId }) {
  const folder = await Folder.findOne({
    where: {
      id: folderId,
      user_id: userId,
    },
  });

  if (!folder) {
    throw new Error("Pasta não encontrada");
  }

  await MediaList.update(
    { folder_id: null },
    {
      where: {
        user_id: userId,
        folder_id: folderId,
      },
    },
  );

  await folder.destroy();

  return { success: true };
}