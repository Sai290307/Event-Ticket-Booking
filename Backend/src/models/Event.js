import { Schema, model } from "mongoose";

const eventSchema = new Schema(
  {
    title: { type: String, required: true },

    type: {
      type: String,
      enum: ["movie", "concert"],
      required: true,
    },

    // Common Fields
    genres: [String],
    language: String,
    description: String,
    rating: Number,
    price: Number,

    image: {
      url: String,
      hint: String,
    },

    tags: [String],
    cast: [
      {
        name: String,
        role: String,
      },
    ],

    director: String,

    theatres: [
      {
        name: String,
        city: String,
        showtimes: [String],

        seatLayout: {
          rows: Number,
          seatsPerRow: Number,
        },

        totalTickets: Number,
        ticketsSold: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Concert Specific
    artists: [
      {
        name: String,
        role: String,
      },
    ],

    venues: [
      {
        name: String,
        city: String,
        date: Date,

        totalTickets: Number,
        ticketsSold: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

export default model("Event", eventSchema);
