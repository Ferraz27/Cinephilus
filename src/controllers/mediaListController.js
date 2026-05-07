import {
  createMediaList,
  getUserLists,
  getListById,
} from "../services/mediaListService.js";

export async function create(req, res) {
  try {
    const list = await createMediaList({
      userId: req.user.id,
      ...req.body,
    });

    return res.status(201).json(list);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function index(req, res) {
  try {
    const lists = await getUserLists(req.user.id);

    return res.json(lists);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function show(req, res) {
  try {
    const list = await getListById({
      userId: req.user.id,
      listId: req.params.id,
    });

    return res.json(list);
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
}