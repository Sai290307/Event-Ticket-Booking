import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: String,
  email: String,
  city: String,
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  preferences: {
    genres: [String],
    languages: [String],
    eventTypes: [String]
  },
}, { timestamps: true });

export default model("User", userSchema);
