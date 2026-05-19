import { Router } from "express";


import {
  searchMedia,
  popularMedia,
  mediaVideos,
  mediaDetails,
  updateMediaStatus,
  getMediaStatus,
  getRatingsSummary,
} from "../controllers/mediaController.js";

import {
  createReview,
  getReviews,
  voteReview,
} from "../controllers/mediaReviewController.js";

import { createOrUpdateMediaStatus } from "../controllers/mediaStatusController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { optionalAuthMiddleware } from "../middlewares/optionalAuthMiddleware.js";

const router = Router();

router.get("/search", searchMedia);
router.get("/popular", popularMedia);
router.get("/:tmdbId/videos", mediaVideos);
router.get("/:tmdbId/details", mediaDetails);
router.get("/:tmdbId/ratings-summary", getRatingsSummary);
router.get("/:tmdbId/reviews", optionalAuthMiddleware, getReviews);
router.post("/:tmdbId/reviews", authMiddleware, createReview);
router.post("/reviews/:reviewId/vote", authMiddleware, voteReview);
router.post("/status", authMiddleware, createOrUpdateMediaStatus);
router.get("/:tmdbId/status",authMiddleware,getMediaStatus);


export default router;