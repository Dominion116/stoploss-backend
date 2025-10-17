import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import StopLoss from "../models/StopLoss.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected (Monitor)"))
  .catch((err) => console.error("❌ MongoDB error (Monitor):", err));

// Telegram Bot API
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

// Aster API (price data)
const ASTER_BASE_URL = process.env.ASTER_API_URL || "https://fapi.asterdex.com";

// Helper: Send Telegram alert
const sendTelegramAlert = async (chatId, text) => {
  try {
    await axios.post(TELEGRAM_API, { chat_id: chatId, text });
    console.log(`📩 Alert sent to ${chatId}: ${text}`);
  } catch (err) {
    console.error("⚠️ Telegram error:", err.response?.data || err.message);
  }
};

// Helper: Fetch latest price
const getCurrentPrice = async (symbol) => {
  try {
    const res = await axios.get(`${ASTER_BASE_URL}/fapi/v1/ticker/price`, {
      params: { symbol },
    });
    return parseFloat(res.data.price);
  } catch (err) {
    console.error(`⚠️ Price fetch error for ${symbol}:`, err.message);
    return null;
  }
};

// Monitor job
const monitorStopLosses = async () => {
  console.log("🔍 Checking stop-loss conditions...");

  try {
    const stopLosses = await StopLoss.find();
    if (!stopLosses.length) {
      console.log("ℹ️ No stop-loss records found.");
      return;
    }

    for (const record of stopLosses) {
      const { chat_id, symbol, stop_loss } = record;

      const currentPrice = await getCurrentPrice(symbol);
      if (!currentPrice) continue;

      console.log(
        `💹 ${symbol}: Current ${currentPrice}, Stop-loss ${stop_loss}`
      );

      // Trigger alert when price is near or below stop-loss
      if (currentPrice <= stop_loss * 1.01) {
        await sendTelegramAlert(
          chat_id,
          `⚠️ ${symbol} is near your stop-loss ($${stop_loss}). Current: $${currentPrice}`
        );
      }
    }
  } catch (err) {
    console.error("❌ Monitor error:", err);
  }
};

// Run every 60 seconds
setInterval(monitorStopLosses, 60 * 1000);

// Run immediately on startup
monitorStopLosses();
