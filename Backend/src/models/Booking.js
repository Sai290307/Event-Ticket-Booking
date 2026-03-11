import { Schema, model } from "mongoose";

const bookingSchema = new Schema({
  userId: {
    type: String,
    required: [true, "User ID is required"]
  },

  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "Event ID is required"]
  },

  ticketCount: {
    type: Number,
    required: [true, "Ticket count is required"],
    min: [1, "Must book at least 1 ticket"]
  },
  
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0, "Total amount cannot be negative"]
  },

  showtime: String,
  
  eventDate: {
    type: Date,
    description: "The date of the event (movie showtime, concert date, etc.)"
  },
  
  theatreName: String,

  seatNumbers: {
    type: [String],
    default: []
  },

  paymentStatus: {
    type: String,
    enum: ["completed", "payment_pending"],
    default: "completed"
  },

  bookedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

// Indexes for performance
bookingSchema.index({ userId: 1 });
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ showtime: 1 });
bookingSchema.index({ theatreName: 1 });
bookingSchema.index({ bookedAt: -1 });

// Critical compound index to prevent double bookings
bookingSchema.index({ 
  eventId: 1, 
  showtime: 1, 
  theatreName: 1, 
  seatNumbers: 1 
}, { unique: true });

export default model("Booking", bookingSchema);
