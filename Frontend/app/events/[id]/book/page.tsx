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
import { Label } from "@/components/ui/label";

type EventType = {
  _id: string;
  title: string;
  type: string;
  price: number;
  description: string;
  image?: { url: string; hint: string };
  venues?: {
    name: string;
    city: string;
    date: string;
    totalTickets?: number;
    ticketsSold?: number;
  }[];
  date?: string;
  time?: string;
  tags?: string[];
  ticketTiers?: { name: string; price: number }[];
};

export default function EventBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const [event, setEvent] = useState<EventType | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const authContext = useAuth();
  const user = authContext?.currentUser;

  // Get tier info from URL params
  const tierName = searchParams.get("tier") || "Regular";
  const tierPrice = Number(searchParams.get("price")) || 50;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.EVENTS);
        const data: EventType[] = await res.json();
        
        // Find event that is not movie or concert
        const selected = data.find(
          (e) => e._id === params.id && e.type !== "movie" && e.type !== "concert"
        );

        if (!selected) {
          setError("Event not found");
          return;
        }

        setEvent(selected);
        setSelectedTier(tierName);

        // Set default venue if available
        if (selected.venues && selected.venues.length > 0) {
          setSelectedVenue(selected.venues[0].name);
          setSelectedDate(selected.venues[0].date);
        } else if (selected.date) {
          // Use event's own date if no venues
          setSelectedDate(selected.date);
        }

        // Set default time
        if (selected.time) {
          setSelectedTime(selected.time);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id, tierName]);

  const handleBooking = async () => {
    if (!user) {
      alert("Please log in to book tickets");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    if (ticketCount < 1) {
      alert("Please select at least 1 ticket");
      return;
    }

    setBookingLoading(true);
    setError("");

    try {
      const totalAmount = tierPrice * ticketCount;

      const requestData = {
        userId: user.uid,
        eventId: event?._id,
        ticketCount: Number(ticketCount),
        showtime: selectedTime,
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
          `/checkout?tickets=${ticketCount}&showtime=${selectedTime}&date=${selectedDate}&venue=${encodeURIComponent(selectedVenue)}&event=${encodeURIComponent(event?.title || "")}&tier=${encodeURIComponent(selectedTier)}`
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
            Loading event details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">{error || "Event not found"}</h2>
          <Button onClick={() => router.push("/events")} variant="outline" className="mt-4">
            Browse Other Events
          </Button>
        </Card>
      </div>
    );
  }

  // Generate available dates (next 30 days)
  const availableDates = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    availableDates.push(date.toISOString().split('T')[0]);
  }

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
            <h2 className="text-2xl font-bold">{event.title}</h2>
            <p className="text-muted-foreground">
              {event.tags?.join(" • ") || "Live Event"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="text-sm px-4 py-2">
              {selectedTier} - ₹{tierPrice}
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
                Select your preferred date and time for the event.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Venue Selection (if multiple venues) */}
              {event.venues && event.venues.length > 1 && (
                <div className="space-y-3">
                  <Label>Select Venue</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.venues?.map((venue) => (
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
              )}

              {/* Date Selection */}
              <div className="space-y-3">
                <Label>Select Date</Label>
                <div className="flex flex-wrap gap-2">
                  {availableDates.map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      onClick={() => setSelectedDate(date)}
                      className="text-sm"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="space-y-3">
                  <Label>Select Time</Label>
                  <div className="flex flex-wrap gap-2">
                    {["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"].map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
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
                    onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                    disabled={ticketCount >= 10}
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Maximum 10 tickets per booking
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
                <h3 className="font-semibold text-lg">{event.title}</h3>
                {selectedVenue && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedVenue}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(selectedDate).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{selectedTime}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>
                    {selectedTier} Ticket ({ticketCount} × ₹{tierPrice})
                  </span>
                  <span>
                    ₹{(tierPrice * ticketCount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Convenience Fee (10%)</span>
                  <span>
                    ₹
                    {Math.round(tierPrice * ticketCount * 0.1).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹
                    {Math.round(
                      tierPrice * ticketCount * 1.1
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                className="w-full h-12 text-lg"
                disabled={!selectedDate || !selectedTime || bookingLoading}
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

