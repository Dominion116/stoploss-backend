import express from "express";
import { handleTelegramMessage } from "../controllers/stoplossController.js";

const router = express.Router();

router.post("/webhook", handleTelegramMessage);

export default router;
