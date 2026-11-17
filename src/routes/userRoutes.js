import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import {
  getMe,
  updateMe,
  getMyFavorites,
  updateMyFavorites,
  getMyMediaByStatus,
  getMyAllReviews,
} from "../controllers/userController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safeExt = path.extname(file.originalname || "").toLowerCase();
      cb(null, `avatar-${Date.now()}${safeExt}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Formato de arquivo invalido. Use uma imagem."));
  },
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, upload.single("avatar"), updateMe);
router.get("/me/favorites", authMiddleware, getMyFavorites);
router.put("/me/favorites", authMiddleware, updateMyFavorites);
router.get("/me/media", authMiddleware, getMyMediaByStatus);
router.get("/me/reviews", authMiddleware, getMyAllReviews);

export default router;