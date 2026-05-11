import { Router } from "express";


import {
  searchMedia,
  popularMedia,
  mediaVideos,
  updateMediaStatus,
  getMediaStatus,
} from "../controllers/mediaController.js";

import { createOrUpdateMediaStatus } from "../controllers/mediaStatusController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/search", searchMedia);
router.get("/popular", popularMedia);
router.get("/:tmdbId/videos", mediaVideos);
router.post("/status", authMiddleware, createOrUpdateMediaStatus);
router.get("/:tmdbId/status",authMiddleware,getMediaStatus);


export default router;