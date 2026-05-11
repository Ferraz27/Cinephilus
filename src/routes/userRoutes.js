import { Router } from "express";

import {
  getMe,
  updateMe,
} from "../controllers/userController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);

export default router;