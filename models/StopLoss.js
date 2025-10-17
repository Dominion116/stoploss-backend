import mongoose from "mongoose";

const stopLossSchema = new mongoose.Schema({
  chat_id: { type: String, required: true },
  symbol: { type: String, required: true },
  stop_loss: { type: Number, required: true },
  last_alert_sent: { type: Date, default: null },
});

export default mongoose.model("StopLoss", stopLossSchema);
