import StopLoss from "../models/StopLoss.js";
import axios from "axios";

/**
 * Handles incoming Telegram webhook messages.
 */
export const handleTelegramMessage = async (req, res) => {
  try {
    const message = req.body.message;
    if (!message || !message.text) return res.sendStatus(200);

    const chatId = message.chat.id;
    const text = message.text.trim();

    // Split the message into parts
    const parts = text.split(" ");
    const command = parts[0].toLowerCase();
    const symbol = parts[1]?.toUpperCase();
    const stopLoss = parseFloat(parts[2]);

    console.log("📩 Telegram message received:", { command, symbol, stopLoss });

    // ✅ Handle /start command
    if (command === "/start") {
      await sendTelegramMessage(
        chatId,
        "👋 Welcome to *StopLoss Notifier!*\n\nSet your stop-loss like this:\n`/setstoploss BTCUSDT 58000`\nor `/set_stoploss BTCUSDT 58000`",
        "Markdown"
      );
      return res.sendStatus(200);
    }

    // ✅ Handle /setstoploss or /set_stoploss command
    if ((command === "/setstoploss" || command === "/set_stoploss") && symbol && !isNaN(stopLoss)) {
      await StopLoss.findOneAndUpdate(
        { chat_id: chatId, symbol },
        { stop_loss: stopLoss },
        { upsert: true, new: true }
      );

      console.log(`💾 Stop-loss saved for ${symbol} at $${stopLoss}`);

      await sendTelegramMessage(
        chatId,
        `✅ Stop-loss for *${symbol}* set at *$${stopLoss.toFixed(2)}*`,
        "Markdown"
      );
    } else {
      // ⚠️ Invalid command or missing parameters
      await sendTelegramMessage(
        chatId,
        "⚠️ Usage: `/setstoploss SYMBOL PRICE`\nExample: `/setstoploss BTCUSDT 58000`",
        "Markdown"
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error in handleTelegramMessage:", err.message);
    res.sendStatus(500);
  }
};

/**
 * Sends a message to a Telegram chat.
 */
const sendTelegramMessage = async (chatId, text, parseMode = "Markdown") => {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    });
  } catch (err) {
    console.error("❌ Telegram send error:", err.response?.data || err.message);
  }
};
