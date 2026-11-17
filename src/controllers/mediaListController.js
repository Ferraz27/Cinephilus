import {
  createMediaList,
  getUserLists,
  getListById,
  updateMediaList,
  getListCommentsByOwner,
  createListCommentByOwner,
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

export async function update(req, res) {
  try {
    const list = await updateMediaList({
      userId: req.user.id,
      listId: req.params.id,
      ...req.body,
    });

    return res.json(list);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function comments(req, res) {
  try {
    const commentsList = await getListCommentsByOwner({
      userId: req.user.id,
      listId: req.params.id,
    });

    return res.json(commentsList);
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
}

export async function comment(req, res) {
  try {
    const created = await createListCommentByOwner({
      userId: req.user.id,
      listId: req.params.id,
      content: req.body.content,
      parent_comment_id: req.body.parent_comment_id,
    });

    return res.status(201).json(created);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}