import {
  getPublicProfile,
  getPublicFolder,
  getPublicList,
  getListComments,
  toggleListLike,
  createListComment,
  searchPublicUsers,
  getPublicUserWatched,
  getPublicUserReviews,
} from "../services/publicAccessService.js";

export async function profile(req, res) {
  try {
    const result = await getPublicProfile(req.params.username);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
}

export async function folder(req, res) {
  try {
    const result = await getPublicFolder(req.params.username, req.params.folderId);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
}

export async function list(req, res) {
  try {
    const result = await getPublicList(
      req.params.username,
      req.params.listId,
      req.user?.id || null,
    );
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
}

export async function comments(req, res) {
  try {
    const commentsList = await getListComments(req.params.listId);
    return res.json(commentsList);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
}

export async function like(req, res) {
  try {
    const result = await toggleListLike({
      userId: req.user.id,
      listId: req.params.listId,
    });
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function comment(req, res) {
  try {
    const result = await createListComment({
      userId: req.user.id,
      listId: req.params.listId,
      content: req.body.content,
      parent_comment_id: req.body.parent_comment_id,
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function searchUsers(req, res) {
  try {
    const q = req.query.q || req.query.query || "";
    const users = await searchPublicUsers(q);
    return res.json(users);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function watched(req, res) {
  try {
    const result = await getPublicUserWatched(req.params.username);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
}

export async function publicReviews(req, res) {
  try {
    const result = await getPublicUserReviews(req.params.username);
    return res.json(result);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
}