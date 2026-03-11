import express from 'express';
import { createBooking, getUserBookings, getBookingsByEventId, getBookingById } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/user/:uid', getUserBookings);
router.get('/event/:eventId', getBookingsByEventId);
router.get('/booking/:id', getBookingById);

export default router;
