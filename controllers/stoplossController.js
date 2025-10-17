import StopLoss from "../models/StopLoss.js";
import axios from "axios";

export const handleTelegramMessage = async (req, res) => {
  try {
    const message = req.body.message;
    if (!message || !message.text) return res.sendStatus(200);

    const chatId = message.chat.id;
    const text = message.text.trim().split(" ");

    const command = text[0];
    const symbol = text[1]?.toUpperCase();
    const stopLoss = parseFloat(text[2]);

    if (command === "/set_stoploss" && symbol && !isNaN(stopLoss)) {
      await StopLoss.findOneAndUpdate(
        { chat_id: chatId, symbol },
        { stop_loss: stopLoss },
        { upsert: true, new: true }
      );

      await sendMessage(chatId, `✅ Stop-loss for ${symbol} set at $${stopLoss}`);
    } else {
      await sendMessage(chatId, "⚠️ Usage: /set_stoploss SYMBOL PRICE\nExample: /set_stoploss BTCUSDT 58000");
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

const sendMessage = async (chatId, text) => {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  await axios.post(url, { chat_id: chatId, text });
};
