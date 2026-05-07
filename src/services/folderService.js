import Folder from "../models/Folder.js";
import MediaList from "../models/MediaList.js";

export async function createFolder({ userId, title, description }) {
  return Folder.create({
    user_id: userId,
    title,
    description,
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
    include: [MediaList],
  });

  if (!folder) {
    throw new Error("Pasta não encontrada");
  }

  return folder;
}