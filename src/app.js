import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import mediaRoutes from "./routes/mediaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import mediaListRoutes from "./routes/mediaListRoutes.js";


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "Cinephilus API running",
  });
});

app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/users", userRoutes);
app.use("/folders", folderRoutes);
app.use("/lists", mediaListRoutes);

export default app;