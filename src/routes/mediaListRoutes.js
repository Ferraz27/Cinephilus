import { Router } from "express";

import {
  create,
  index,
  show,
} from "../controllers/mediaListController.js";

import { create as createItem } from "../controllers/listItemController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, index);
router.get("/:id", authMiddleware, show);
router.post("/", authMiddleware, create);
router.post("/:id/items", authMiddleware, createItem);

export default router;