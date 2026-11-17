import { Router } from "express";

import {
  create,
  index,
  lists,
  update,
  destroy,
} from "../controllers/folderController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, index);
router.get("/:id/lists", authMiddleware, lists);
router.post("/", authMiddleware, create);
router.patch("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, destroy);

export default router;