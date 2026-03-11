'use client';

import { useEffect, useState } from "react";
import { Ticket, MapPin, Calendar, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from '@/contexts/authContexts';

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Concert = {
  _id: string;
  title: string;
  type: string;
  price: number;
  description: string;
  image?: { url: string; hint: string };
  artists?: { _id: string; name: string; role: string }[];
  venues?: {
    name: string;
    city: string;
    date: string;
    totalTickets?: number;
    ticketsSold?: number;
  }[];
  showtimes?: string[];
  tags?: string[];
};

export default function ConcertBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const [concert, setConcert] = useState<Concert | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedShowtime, setSelectedShowtime] = useState<string>("");
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const authContext = useAuth();
  const user = authContext?.currentUser;

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.EVENTS);
        const data: Concert[] = await res.json();
        const selected = data.find((e) => e.type === "concert" && e._id === params.id);

        if (!selected) {
          setError("Concert not found");
          return;
        }

        setConcert(selected);

        // Set default venue if available
        if (selected.venues && selected.venues.length > 0) {
          setSelectedVenue(selected.venues[0].name);
          setSelectedDate(selected.venues[0].date);
        }

        // Set default showtime if available
        if (selected.showtimes && selected.showtimes.length > 0) {
          setSelectedShowtime(selected.showtimes[0]);
        }
      } catch (err) {
        console.error("Error fetching concert:", err);
        setError("Failed to load concert details");
      } finally {
        setLoading(false);
      }
    };

    fetchConcert();
  }, [params.id]);

  const handleBooking = async () => {
    if (!user) {
      alert("Please log in to book tickets");
      return;
    }

    if (!selectedVenue || !selectedDate || !selectedShowtime) {
      alert("Please select venue, date and time");
      return;
    }

    if (ticketCount < 1) {
      alert("Please select at least 1 ticket");
      return;
    }

    setBookingLoading(true);
    setError("");

    try {
      const totalAmount = (concert?.price || 0) * ticketCount;

      const requestData = {
        userId: user.uid,
        eventId: concert?._id,
        ticketCount: Number(ticketCount),
        showtime: selectedShowtime,
        eventDate: selectedDate,
        theatreName: selectedVenue,
        totalAmount: Number(totalAmount),
      };

      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to checkout with booking details
        router.push(
          `/checkout?tickets=${ticketCount}&showtime=${selectedShowtime}&venue=${encodeURIComponent(selectedVenue)}&event=${encodeURIComponent(concert?.title || "")}`
        );
      } else {
        setError(result.message || "Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError("Network error. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="text-xl text-muted-foreground animate-pulse">
            Loading concert details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !concert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="text-5xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold mb-2">{error || "Concert not found"}</h2>
          <Button onClick={() => router.push("/concerts")} variant="outline" className="mt-4">
            Browse Other Concerts
          </Button>
        </Card>
      </div>
    );
  }

  const currentVenue = concert.venues?.find((v) => v.name === selectedVenue);
  const availableTickets = currentVenue
    ? (currentVenue.totalTickets || 100) - (currentVenue.ticketsSold || 0)
    : 100;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Event Info Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{concert.title}</h2>
            <p className="text-muted-foreground">
              {concert.tags?.join(" • ") || "Live Concert"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="text-sm px-4 py-2">
              ₹{concert.price?.toLocaleString() || 900} onwards
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-2">
              {availableTickets} tickets left
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Book Tickets</CardTitle>
              <CardDescription>
                Select your preferred venue, date, and time for the concert.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Venue Selection */}
              <div className="space-y-3">
                <Label>Select Venue</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {concert.venues?.map((venue) => (
                    <Button
                      key={venue.name}
                      variant={selectedVenue === venue.name ? "default" : "outline"}
                      className="justify-start h-auto py-3"
                      onClick={() => {
                        setSelectedVenue(venue.name);
                        setSelectedDate(venue.date);
                      }}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-semibold">{venue.name}</div>
                        <div className="text-xs opacity-80">{venue.city}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              {selectedDate && (
                <div className="space-y-3">
                  <Label>Date</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>
                      {new Date(selectedDate).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Showtime Selection */}
              {concert.showtimes && concert.showtimes.length > 0 && (
                <div className="space-y-3">
                  <Label>Select Time</Label>
                  <div className="flex flex-wrap gap-2">
                    {concert.showtimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedShowtime === time ? "default" : "outline"}
                        onClick={() => setSelectedShowtime(time)}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ticket Count */}
              <div className="space-y-3">
                <Label>Number of Tickets</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    disabled={ticketCount <= 1}
                  >
                    -
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">
                    {ticketCount}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTicketCount(Math.min(availableTickets, ticketCount + 1))}
                    disabled={ticketCount >= availableTickets}
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Maximum {availableTickets} tickets available
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Booking Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Event Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{concert.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedVenue || "Select a venue"}</span>
                </div>
                {selectedDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(selectedDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                )}
                {selectedShowtime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{selectedShowtime}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>
                    Ticket Price ({ticketCount} × ₹{concert.price || 900})
                  </span>
                  <span>
                    ₹{((concert.price || 900) * ticketCount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Convenience Fee (10%)</span>
                  <span>
                    ₹
                    {Math.round((concert.price || 900) * ticketCount * 0.1).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹
                    {Math.round(
                      (concert.price || 900) * ticketCount * 1.1
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                className="w-full h-12 text-lg"
                disabled={!selectedVenue || !selectedDate || !selectedShowtime || bookingLoading}
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

