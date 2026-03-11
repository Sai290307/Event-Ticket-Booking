'use client';

import { useEffect, useState } from "react";
import { Armchair, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from '@/contexts/authContexts';

import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Theatre = {
  name: string;
  city: string;
  showtimes: string[];
  totalTickets: number;
  ticketsSold: number;
  seatLayout?: {
    rows: number;
    seatsPerRow: number;
  };
};

type Movie = {
  _id: string;
  title: string;
  price: number;
  type: string;
  genres: string[];
  language: string;
  description: string;
  rating: number;
  image?: {
    url?: string;
    hint?: string;
  };
  cast: Array<{ name: string; role: string }>;
  director: string;
  theatres: Theatre[];
  showtimes?: string[];
  seatLayout?: {
    rows: number;
    seatsPerRow: number;
  };
  totalTickets?: number;
  ticketsSold?: number;
};

type Booking = {
  seatNumbers: string[];
  showtime: string;
  theatreName?: string;
  eventDate?: string;
};

export default function SeatSelectionPage({
  params,
}: {
  params: { id: string };
}) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedShowtime, setSelectedShowtime] = useState<string>("");
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const authContext = useAuth();
  const user = authContext?.currentUser; // Get current user
  
  // Get parameters from URL
  const showtimeFromUrl = searchParams.get("time");
  const theatreFromUrl = searchParams.get("theatre");
  const dateFromUrl = searchParams.get("date");

  // Generate available dates (next 14 days for movies)
  const availableDates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    availableDates.push(date.toISOString().split('T')[0]);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch movie details
        const eventRes = await fetch(API_ENDPOINTS.EVENTS);
        const events: Movie[] = await eventRes.json();
        const selectedMovie = events.find((e) => e._id === params.id);

        if (!selectedMovie) return;

        setMovie(selectedMovie);
        
        // Find the selected theatre from URL or use first available
        let theatre = null;
        if (theatreFromUrl) {
          theatre = selectedMovie.theatres?.find(t => t.name === theatreFromUrl) || null;
        }
        
        if (!theatre && selectedMovie.theatres?.length > 0) {
          theatre = selectedMovie.theatres[0];
        }
        
        setSelectedTheatre(theatre);
        if (showtimeFromUrl && theatre?.showtimes && theatre.showtimes.includes(showtimeFromUrl)) {
          setSelectedShowtime(showtimeFromUrl);
        } else if (theatre?.showtimes && theatre.showtimes.length > 0 && theatre.showtimes[0]) {
          setSelectedShowtime(theatre.showtimes[0]);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load movie data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, showtimeFromUrl, theatreFromUrl]);

  // Fetch bookings when showtime, date or theatre changes
  useEffect(() => {
    const fetchBookingsForShowtime = async () => {
      if (!selectedShowtime || !selectedTheatre || !movie) return;
      
      try {
        const bookingRes = await fetch(
          API_ENDPOINTS.BOOKINGS_BY_EVENT(params.id)
        );
        const bookings: Booking[] = await bookingRes.json();

        // Filter bookings by showtime and theatre
        // Also check eventDate if it exists in the booking
        const filteredBookings = bookings.filter(b => 
          b.showtime === selectedShowtime && 
          (!b.theatreName || b.theatreName === selectedTheatre.name)
        );
        
        // For backward compatibility: if eventDate exists in booking, filter by it
        // Otherwise show all bookings for that showtime (old bookings without eventDate)
        const finalBookings = filteredBookings.filter(b => {
          if (b.eventDate) {
            return b.eventDate === selectedDate;
          }
          // For old bookings without eventDate, show them as booked
          return true;
        });
        
        const allBookedSeats = finalBookings.flatMap((b) => b.seatNumbers);
        
        setBookedSeats(allBookedSeats);
        // Clear selected seats when showtime or date changes
        setSelectedSeats([]);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load seat availability");
      }
    };

    fetchBookingsForShowtime();
  }, [selectedShowtime, selectedDate, selectedTheatre, params.id, movie]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <Armchair className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground animate-pulse">Loading seat layout...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">Movie not found</h2>
          <Button onClick={() => router.push('/movies')} variant="outline" className="mt-4">
            Browse Movies
          </Button>
        </Card>
      </div>
    );
  }

  if (!selectedTheatre) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">No theatres available</h2>
          <Button onClick={() => router.push('/movies')} variant="outline" className="mt-4">
            Browse Other Movies
          </Button>
        </Card>
      </div>
    );
  }

  // Use theatre-specific data or fallback to movie-level data
  const seatLayout = selectedTheatre.seatLayout || movie.seatLayout || { rows: 12, seatsPerRow: 14 };
  const totalTickets = selectedTheatre.totalTickets || movie.totalTickets || 168;
  const ticketsSold = selectedTheatre.ticketsSold || movie.ticketsSold || 0;
  const SEAT_PRICE = movie.price;
  const totalCost = selectedSeats.length * SEAT_PRICE;
  const remainingSeats = totalTickets - ticketsSold - bookedSeats.length;

  const toggleSeat = (seatId: string) => {
    // Don't allow selecting more than remaining available seats
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= remainingSeats) {
      alert(`Only ${remainingSeats} seats available`);
      return;
    }
    
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId],
    );
  };

  const renderSeats = () => {
    const rows = [];
    const totalRows = seatLayout.rows || 12;
    const seatsPerRow = seatLayout.seatsPerRow || 14;

    for (let row = 0; row < totalRows; row++) {
      const rowLabel = String.fromCharCode(65 + row); // A, B, C, etc.
      const rowSeats = [];

      // Add row label
      rowSeats.push(
        <div key={`label-${row}`} className="w-8 flex items-center justify-center font-semibold text-muted-foreground">
          {rowLabel}
        </div>
      );

      for (let col = 1; col <= seatsPerRow; col++) {
        const seatId = `${rowLabel}${col}`;
        const isBooked = bookedSeats.includes(seatId);
        const isSelected = selectedSeats.includes(seatId);
        const isAvailable = !isBooked && (selectedSeats.length < remainingSeats || isSelected);

        rowSeats.push(
          <Button
            key={seatId}
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-md transition-all duration-200",
              isAvailable && !isSelected && "hover:bg-primary/20 hover:scale-105",
              isBooked && "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50",
              isSelected && "bg-primary text-primary-foreground shadow-md scale-105",
              "border-2",
              isSelected ? "border-primary" : isBooked ? "border-gray-400" : "border-muted"
            )}
            onClick={() => isAvailable && toggleSeat(seatId)}
            disabled={isBooked || !isAvailable}
            title={`${seatId} - ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
          >
            {isBooked ? (
              <X className="h-5 w-5" />
            ) : (
              <Armchair className={cn("h-5 w-5", isSelected && "fill-primary-foreground")} />
            )}
          </Button>
        );
      }

      rows.push(
        <div key={`row-${row}`} className="flex gap-2 items-center mb-3">
          {rowSeats}
        </div>
      );
    }

    return rows;
  };

 const handleBooking = async () => {
  // Validate user is logged in
  if (!user) {
    alert("Please log in to book tickets");
    return;
  }

  if (selectedSeats.length === 0) {
    alert("Please select at least one seat");
    return;
  }

  if (!selectedDate) {
    alert("Please select a date");
    return;
  }

  setBookingLoading(true);
  setError("");

  try {
    // Use the selected date from date picker
    const eventDate = selectedDate;

    console.log("Sending booking request with data:", {
      userId: user.uid,
      eventId: movie._id,
      ticketCount: selectedSeats.length,
      seatNumbers: selectedSeats,
      showtime: selectedShowtime,
      eventDate: eventDate,
      theatreName: selectedTheatre.name,
      totalAmount: totalCost,
    });
    
    // Ensure ticketCount and totalAmount are numbers
    const requestData = {
      userId: user.uid,
      eventId: movie._id,
      ticketCount: Number(selectedSeats.length),
      seatNumbers: selectedSeats,
      showtime: selectedShowtime,
      eventDate: eventDate,
      theatreName: selectedTheatre.name,
      totalAmount: Number(totalCost)
    };
    
    console.log("Parsed request data:", requestData);
    
    // Send booking request
    const response = await fetch(API_ENDPOINTS.BOOKINGS, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("Booking response status:", response.status);
    
    let result;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.indexOf("application/json") !== -1) {
      result = await response.json();
      console.log("Booking response JSON:", result);
    } else {
      const text = await response.text();
      console.log("Booking response text:", text);
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
    }

    if (response.ok) {
      console.log("Booking successful!");
      // Success - redirect to checkout
      router.push(`/checkout?seats=${selectedSeats.join(',')}&showtime=${selectedShowtime}&theatre=${encodeURIComponent(selectedTheatre.name)}&date=${selectedDate}`);
    } else {
      console.log("Booking failed with message:", result.message);
      setError(result.message || "Booking failed. Please try again.");
    }
  } catch (error) {
    console.error("Booking network error:", error);
    setError("Network error. Please try again.");
  } finally {
    setBookingLoading(false);
  }
};


const refreshSeatData = async () => {
  try {
    const bookingRes = await fetch(
      `http://localhost:5000/api/bookings?eventId=${params.id}`
    );
    
    const contentType = bookingRes.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const bookings: Booking[] = await bookingRes.json();
      
      const filteredBookings = bookings.filter(b => 
        b.showtime === selectedShowtime && 
        (!b.theatreName || b.theatreName === selectedTheatre.name)
      );
      
      const allBookedSeats = filteredBookings.flatMap((b) => b.seatNumbers);
      setBookedSeats(allBookedSeats);
      setSelectedSeats([]); // Clear selection since some might now be booked
    } else {
      console.error("Non-JSON response from bookings API");
    }
  } catch (error) {
    console.error("Error refreshing seat data:", error);
  }
};

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Theatre and Showtime Info Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{movie.title}</h2>
            <p className="text-muted-foreground">
              {selectedTheatre.name}, {selectedTheatre.city}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="text-sm px-4 py-2">
              Showtime: {selectedShowtime}
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-2">
              {remainingSeats} seats left
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Seat Layout - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Select Your Seats</CardTitle>
              <CardDescription>
                Click on available seats to select them. Selected seats will be highlighted.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center pt-6">
              {/* Screen indicator */}
              <div className="w-full flex flex-col items-center mb-12">
                <div className="relative w-4/5 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <div className="relative w-3/4 h-8 rounded-t-full bg-gradient-to-b from-primary/30 to-transparent">
                  <div className="absolute inset-0 blur-sm bg-primary/20 rounded-t-full" />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                  SCREEN
                </p>
              </div>

              {/* Seat Grid */}
              <div className="w-full overflow-x-auto pb-6 pl-12">
                <div className="min-w-[800px] px-4">
                  {/* Column numbers */}
                  <div className="flex gap-2 ml-8 mb-2">
                    <div className="w-8"></div>
                    {Array.from({ length: seatLayout.seatsPerRow || 14 }, (_, i) => (
                      <div key={`col-${i+1}`} className="w-10 text-center text-xs font-semibold text-muted-foreground">
                        {i+1}
                      </div>
                    ))}
                  </div>
                  
                  {/* Seats */}
                  <div className="space-y-2">
                    {renderSeats()}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-8 mt-10 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md border-2 border-muted bg-background flex items-center justify-center">
                    <Armchair className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                    <Armchair className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-gray-300 text-gray-500 border-2 border-gray-400 flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Booked</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary - Takes 1/3 width */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Booking Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Select Date</p>
                <div className="flex flex-wrap gap-2">
                  {availableDates.map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDate(date)}
                      className="text-xs"
                    >
                      {new Date(date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Movie Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{movie.title}</h3>
                <p className="text-sm text-muted-foreground">{movie.language} • {movie.genres.join(', ')}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{selectedTheatre.name}</Badge>
                  {selectedDate && (
                    <Badge variant="secondary">
                      {new Date(selectedDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Badge>
                  )}
                  {selectedShowtime && (
                    <Badge variant="secondary">{selectedShowtime}</Badge>
                  )}
                </div>
              </div>

              {/* Selected Seats */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Seats</p>
                {selectedSeats.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.sort().map((seat) => (
                      <Badge key={seat} className="text-sm px-3 py-1 bg-primary text-primary-foreground">
                        {seat}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic p-3 bg-muted/30 rounded-lg text-center">
                    No seats selected yet
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Ticket Price ({selectedSeats.length} × ₹{SEAT_PRICE})</span>
                  <span>₹{(SEAT_PRICE * selectedSeats.length).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Convenience Fee (10%)</span>
                  <span>₹{(SEAT_PRICE * selectedSeats.length * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary">₹{(SEAT_PRICE * selectedSeats.length * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                className="w-full h-12 text-lg"
                disabled={selectedSeats.length === 0 || bookingLoading || !selectedDate}
                onClick={handleBooking}
              >
                {bookingLoading ? "Processing..." : "Confirm Booking"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By confirming, you agree to our terms and conditions
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
