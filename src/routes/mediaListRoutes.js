import { Router } from "express";

import {
  create,
  index,
  show,
  update,
  comments,
  comment,
} from "../controllers/mediaListController.js";

import { create as createItem } from "../controllers/listItemController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, index);
router.get("/:id", authMiddleware, show);
router.get("/:id/comments", authMiddleware, comments);
router.post("/:id/comments", authMiddleware, comment);
router.post("/", authMiddleware, create);
router.patch("/:id", authMiddleware, update);
router.post("/:id/items", authMiddleware, createItem);

export default router;