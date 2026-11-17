import { Router } from "express";

import { optionalAuthMiddleware } from "../middlewares/optionalAuthMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  profile,
  folder,
  list,
  comments,
  like,
  comment,
  searchUsers,
  watched,
  publicReviews,
} from "../controllers/publicController.js";

const router = Router();

router.get("/users", optionalAuthMiddleware, searchUsers);
router.get("/users/:username", optionalAuthMiddleware, profile);
router.get("/users/:username/watched", optionalAuthMiddleware, watched);
router.get("/users/:username/reviews", optionalAuthMiddleware, publicReviews);
router.get("/users/:username/folders/:folderId", optionalAuthMiddleware, folder);
router.get("/users/:username/lists/:listId", optionalAuthMiddleware, list);
router.get("/lists/:listId/comments", optionalAuthMiddleware, comments);
router.post("/lists/:listId/like", authMiddleware, like);
router.post("/lists/:listId/comments", authMiddleware, comment);

export default router;