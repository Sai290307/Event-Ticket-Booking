// Add this at the top of your booking controller
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import Interaction from '../models/Interaction.js';

export async function createBooking(req, res) {
  
  try {
    // Extract data from request
    const { userId, eventId, ticketCount, seatNumbers, showtime, eventDate, theatreName, totalAmount } = req.body;

    // Log extracted data
    console.log("Extracted data:", { 
      userId, 
      eventId, 
      ticketCount, 
      seatNumbers, 
      showtime,
      eventDate, 
      theatreName,
      totalAmount
    });

    // Validate input
    if (!userId || !eventId || !ticketCount) {
      console.log("Validation failed: Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (typeof ticketCount !== 'number' || ticketCount <= 0) {
      console.log("Validation failed: Invalid ticket count");
      return res.status(400).json({ message: `Invalid ticket count: ${ticketCount}` });
    }

    // Validate that eventId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      console.log("Validation failed: Invalid eventId format");
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    // Find event
    console.log("Finding event with ID:", eventId);
    const event = await Event.findById(eventId);
    console.log("Found event:", event ? "Yes" : "No");
    
    if (!event) {
      console.log("Event not found");
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("Event details:", {
      id: event._id,
      title: event.title,
      type: event.type
    });

    if (event.type === "movie") {
      
      if (!showtime || !theatreName) {
        console.log("Showtime or theatre name missing");
        return res.status(400).json({ message: "Showtime and theatre name required for movie events" });
      }

      if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length !== ticketCount) {
        console.log("Seat validation failed");
        return res.status(400).json({ message: "Seat count mismatch or invalid seat format" });
      }

      // Find the specific theatre
      const theatreIndex = event.theatres.findIndex(t => t.name === theatreName);

      
      if (theatreIndex === -1) {
        return res.status(400).json({ message: `Theatre '${theatreName}' not found for this event` });
      }

      const theatre = event.theatres[theatreIndex];
      console.log("Found theatre:", {
        name: theatre.name,
        totalTickets: theatre.totalTickets,
        ticketsSold: theatre.ticketsSold
      });
      const existingBooking = await Booking.findOne({
        eventId,
        showtime,
        theatreName,
        seatNumbers: { $in: seatNumbers }
      });
      
      if (existingBooking) {
        return res.status(400).json({ message: "One or more seats already booked" });
      }

      // Check theatre-specific ticket availability
      console.log("Checking theatre ticket availability:", {
        ticketsSold: theatre.ticketsSold,
        ticketCount,
        totalTickets: theatre.totalTickets,
        wouldExceed: theatre.ticketsSold + ticketCount > theatre.totalTickets
      });
      
      if (theatre.ticketsSold + ticketCount > theatre.totalTickets) {
        const remaining = theatre.totalTickets - theatre.ticketsSold;
        console.log("Not enough tickets available at theatre:", { remaining });
        return res.status(400).json({ 
          message: `Not enough tickets available at ${theatreName}. Only ${remaining} seats left.` 
        });
      }

      // Update the theatre's tickets sold in memory
      console.log("Updating theatre tickets sold in memory");
      event.theatres[theatreIndex].ticketsSold += ticketCount;
      // Save the entire event document
      await event.save();

    } else {
      // Handle concerts and other event types
      console.log("Processing non-movie event");
      // Add specific logic for concerts if needed
    }

    // Create booking record with validatio
    
    const bookingData = {
      userId: userId, // This is now a string
      eventId: eventId,
      ticketCount: ticketCount,
      totalAmount: totalAmount || ticketCount * (event.price || 0),
      showtime: event.type === "movie" ? showtime : undefined,
      eventDate: eventDate ? new Date(eventDate) : (event.type === "movie" && showtime ? new Date(showtime) : undefined),
      theatreName: event.type === "movie" ? theatreName : undefined,
      seatNumbers: event.type === "movie" ? seatNumbers : undefined,
      paymentStatus: "completed" // Default to completed for now
    };
    
    // Validate the booking data before saving
    const bookingDoc = new Booking(bookingData);
    const validationError = bookingDoc.validateSync();
    
    if (validationError) {
      return res.status(400).json({ 
        message: "Invalid booking data", 
        details: validationError.message 
      });
    }
    
    // Save the booking
    const booking = await Booking.create(bookingData);
    await Interaction.create({
      userId,
      eventId,
      action: "book"
    });

    console.log("Booking successful");
    res.status(201).json({
      message: "Booking successful",
      booking
    });
  } catch (error) {
    console.error("Booking error:", error);
    
    // Handle duplicate key errors (seat already booked)
    if (error.code === 11000) {
      console.log("Duplicate key error - seats already booked");
      return res.status(400).json({ message: "One or more seats already booked" });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      console.log("Validation error:", error.message);
      console.log("Validation errors:", error.errors);
      return res.status(400).json({ 
        message: "Invalid data provided", 
        details: error.message 
      });
    }
    
    // Handle MongoDB validation errors
    if (error.name === 'MongoServerError' && error.code === 121) {
      console.log("MongoDB validation error:", error.errInfo);
      return res.status(400).json({ 
        message: "Document failed validation", 
        details: error.errInfo 
      });
    }
    
    console.log("Unexpected error:", error.message);
    res.status(500).json({ message: "Booking failed due to server error" });
  }
}

export async function getUserBookings(req, res) {
  try {
    const { uid } = req.params;
    
    // Fetch bookings and try to populate event details
    let bookings = await Booking.find({ userId: uid })
      .sort({ bookedAt: -1 }); // Most recent first
    
    // Try to populate events - if it fails, we'll use fallback
    try {
      bookings = await Booking.find({ userId: uid })
        .populate('eventId', 'title type imageUrl price theatres venues')
        .sort({ bookedAt: -1 });
    } catch (popError) {
      console.log('Population failed, using raw data');
    }
    
    // Transform the data to include eventTitle for frontend compatibility
    const transformedBookings = bookings.map(booking => {
      // Check if eventId is populated (object) or just an ID (string)
      const eventData = typeof booking.eventId === 'object' ? booking.eventId : null;
      
      // Calculate eventStatus based on showtime/event date
      let eventStatus = 'upcoming';
      const now = new Date();
      
      if (eventData) {
        // For movies, check showtime
        if (booking.showtime) {
          const showtimeDate = new Date(booking.showtime);
          if (showtimeDate < now) {
            eventStatus = 'completed';
          }
        }
        // For concerts, check venue date
        else if (eventData.venues && eventData.venues.length > 0) {
          const venueDate = eventData.venues[0]?.date;
          if (venueDate && new Date(venueDate) < now) {
            eventStatus = 'completed';
          }
        }
      }
      
      return {
        _id: booking._id,
        userId: booking.userId,
        eventId: eventData?._id || booking.eventId,
        ticketCount: booking.ticketCount,
        totalAmount: booking.totalAmount,
        showtime: booking.showtime,
        eventDate: booking.eventDate,
        theatreName: booking.theatreName,
        seatNumbers: booking.seatNumbers,
        createdAt: booking.bookedAt,
        // Handle populated event data or provide fallback
        eventTitle: eventData?.title || `Event ${booking.eventId}`,
        eventType: eventData?.type,
        eventImage: eventData?.imageUrl,
        eventPrice: eventData?.price,
        // Status fields
        paymentStatus: booking.paymentStatus || 'completed',
        eventStatus: eventStatus
      };
    });
    
    res.json(transformedBookings);
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ message: "Failed to retrieve bookings" });
  }
}

// Get bookings by event ID
export async function getBookingsByEventId(req, res) {
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }
    
    const bookings = await Booking.find({ eventId })
      .populate('eventId', 'title type imageUrl price')
      .sort({ bookedAt: -1 });
    
    // Transform to include eventDate as string for frontend
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      userId: booking.userId,
      eventId: booking.eventId,
      ticketCount: booking.ticketCount,
      totalAmount: booking.totalAmount,
      showtime: booking.showtime,
      eventDate: booking.eventDate ? booking.eventDate.toISOString().split('T')[0] : undefined,
      theatreName: booking.theatreName,
      seatNumbers: booking.seatNumbers,
      paymentStatus: booking.paymentStatus,
      bookedAt: booking.bookedAt,
      createdAt: booking.bookedAt
    }));
    
    res.json(transformedBookings);
  } catch (error) {
    console.error("Get bookings by event error:", error);
    res.status(500).json({ message: "Failed to retrieve bookings" });
  }
}

// Get booking by ID
export async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }
    
    const booking = await Booking.findById(id).populate('eventId', 'title type');
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const eventData = typeof booking.eventId === 'object' ? booking.eventId : null;
    const eventDate = booking.showtime ? new Date(booking.showtime) : null;
    const now = new Date();
    
    // Determine event status based on showtime
    let eventStatus = 'upcoming';
    if (eventDate && eventDate < now) {
      eventStatus = 'completed';
    }
    
    res.json({
      _id: booking._id,
      userId: booking.userId,
      eventId: eventData?._id || booking.eventId,
      ticketCount: booking.ticketCount,
      totalAmount: booking.totalAmount,
      showtime: booking.showtime,
      eventDate: booking.eventDate,
      theatreName: booking.theatreName,
      seatNumbers: booking.seatNumbers,
      createdAt: booking.bookedAt,
      eventTitle: eventData?.title || `Event ${booking.eventId}`,
      eventType: eventData?.type,
      paymentStatus: booking.paymentStatus || 'completed',
      eventStatus: eventStatus
    });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({ message: "Failed to retrieve booking" });
  }
}
