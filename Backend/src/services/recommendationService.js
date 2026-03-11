import  Event  from "../models/Event.js";
import  Booking  from "../models/Booking.js";

export async function getRecommendations(user) {

  // Get user's booked event IDs to exclude from recommendations
  const bookings = await Booking.find({ userId: user.firebaseUid });
  const bookedIds = bookings.map(b => b.eventId.toString());

  // Get all events
  let events = await Event.find();

  // Filter out already booked events
  const filtered = events.filter(
    e => !bookedIds.includes(e._id.toString())
  );

  const scored = filtered.map(event => {

    // Genre score - check if event genres match user preferences
    let genreScore = 0;
    if (user.preferences?.genres && event.genres) {
      const matchingGenres = event.genres.filter(g =>
        user.preferences.genres.includes(g)
      );
      genreScore = matchingGenres.length > 0 ? 1 : 0;
    }

    // Calculate popularity based on theatres (for movies) or venues (for concerts)
    let totalTickets = 0;
    let ticketsSold = 0;

    if (event.theatres && event.theatres.length > 0) {
      // For movies - sum up from theatres
      event.theatres.forEach(theatre => {
        totalTickets += theatre.totalTickets || 0;
        ticketsSold += theatre.ticketsSold || 0;
      });
    } else if (event.venues && event.venues.length > 0) {
      // For concerts - sum up from venues
      event.venues.forEach(venue => {
        totalTickets += venue.totalTickets || 0;
        ticketsSold += venue.ticketsSold || 0;
      });
    }

    // Popularity score: percentage of tickets sold (0 to 1)
    let popularity = totalTickets > 0 ? ticketsSold / totalTickets : 0;

    // Rating score (0 to 1, assuming rating is out of 5 or 10)
    let rating = (event.rating || 0);
    // Normalize rating if it's out of 10 (common for movies)
    if (rating > 5) rating = rating / 10;
    // If rating is out of 5, it's already normalized
    
    // Calculate weighted score
    // 40% popularity, 30% genre match, 30% rating
    let score =
      0.4 * popularity +
      0.3 * genreScore +
      0.3 * rating;

    return { event, score, popularity, genreScore, rating };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top 10 events
  return scored.slice(0, 10).map(s => s.event);
}
