import express from "express";
import cors from "cors";

import mediaRoutes from "./routes/mediaRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import folderRoutes from "./routes/folderRoutes.js";
import mediaListRoutes from "./routes/mediaListRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Cinephilus API running",
  });
});

app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);

app.use("/folders", folderRoutes);
app.use("/lists", mediaListRoutes);

export default app;