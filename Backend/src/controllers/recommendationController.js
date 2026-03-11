import User from "../models/user.js";
import { getRecommendations } from "../services/recommendationService.js";

export async function recommend(req, res) {
  const { userId } = req.params;

  // Find user by firebaseUid (which is the Firebase UID from authentication)
  const user = await User.findOne({ firebaseUid: userId });
  if (!user) {
    // If no user found, return popular events as fallback
    const Event = (await import("../models/Event.js")).default;
    const popularEvents = await Event.find().sort({ rating: -1 }).limit(10);
    return res.json(popularEvents);
  }

  const recommendations = await getRecommendations(user);

  res.json(recommendations);
}
