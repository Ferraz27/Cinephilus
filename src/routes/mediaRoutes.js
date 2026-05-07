import { Router } from "express";
import { searchMedia } from "../controllers/mediaController.js";
import { createOrUpdateMediaStatus } from "../controllers/mediaStatusController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/search", searchMedia);

router.post("/status", authMiddleware, createOrUpdateMediaStatus);

export default router;