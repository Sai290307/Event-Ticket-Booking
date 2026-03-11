// models/Interaction.js
import { Schema, model } from "mongoose";

const interactionSchema = new Schema({
  userId: {
    type: String, // Changed from Schema.Types.ObjectId to String
    required: true
  },

  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },

  action: {
    type: String,
    enum: ["view", "book", "favorite"],
    required: true
  },

  timestamp: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

// Indexes for performance
interactionSchema.index({ userId: 1 });
interactionSchema.index({ eventId: 1 });
interactionSchema.index({ action: 1 });
interactionSchema.index({ timestamp: -1 });

export default model("Interaction", interactionSchema);
