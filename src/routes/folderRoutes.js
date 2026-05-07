import { Router } from "express";

import {
  create,
  index,
  lists,
} from "../controllers/folderController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, index);
router.get("/:id/lists", authMiddleware, lists);
router.post("/", authMiddleware, create);

export default router;