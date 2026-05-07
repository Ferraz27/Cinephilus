import app from "./app.js";
import dotenv from "dotenv";

import sequelize from "./config/database.js";

import "./models/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: true });
    console.log("✅ Models synchronized");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

start();