import {
  createFolder,
  getUserFolders,
  getFolderLists,
} from "../services/folderService.js";

export async function create(req, res) {
  try {
    const folder = await createFolder({
      userId: req.user.id,
      ...req.body,
    });

    return res.status(201).json(folder);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function index(req, res) {
  try {
    const folders = await getUserFolders(req.user.id);

    return res.json(folders);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function lists(req, res) {
  try {
    const folder = await getFolderLists({
      userId: req.user.id,
      folderId: req.params.id,
    });

    return res.json(folder);
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
}