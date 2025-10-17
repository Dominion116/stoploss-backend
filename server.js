import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import telegramRoutes from "./routes/telegram.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Telegram webhook route
app.use("/telegram", telegramRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

app.get("/", (req, res) => res.send("Stop-Loss Backend Running ✅"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
