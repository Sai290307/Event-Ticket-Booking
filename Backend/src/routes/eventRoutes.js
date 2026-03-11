import express from 'express';
const router = express.Router();
import { createEvent, getEvents, getAvailableSeats } from "../controllers/eventController.js";

router.post("/", createEvent);
router.get("/", getEvents);
router.get("/:eventId/seats", getAvailableSeats);

export default router;
