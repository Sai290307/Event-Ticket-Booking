import Event  from "../models/Event.js";
import  Booking  from "../models/Booking.js";

export async function createEvent(req, res) {
  try {
    const event = new Event(req.body);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getEvents(req, res) {
  const events = await Event.find();
  res.json(events);
}

export async function getAvailableSeats(req, res) {
  const { eventId } = req.params;
  const { showtime } = req.query;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: "Event not found" });

  const bookings = await Booking.find({ eventId, showtime });
  const bookedSeats = bookings.flatMap(b => b.seatNumbers);

  const totalSeats = [];
  const rows = event.seatLayout.rows;
  const seatsPerRow = event.seatLayout.seatsPerRow;

  for (let r = 0; r < rows; r++) {
    const rowLetter = String.fromCharCode(65 + r);
    for (let s = 1; s <= seatsPerRow; s++) {
      totalSeats.push(`${rowLetter}${s}`);
    }
  }

  const availableSeats = totalSeats.filter(
    seat => !bookedSeats.includes(seat)
  );

  res.json({ availableSeats });
}
