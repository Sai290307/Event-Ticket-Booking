"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventDetails {
  _id: string;
  title: string;
  type: string;
  description: string;
  rating?: number;
  image?: { url: string; hint?: string };
  artists?: string[];
  venues?: { name: string; city: string; address?: string }[];
  price?: number;
  date?: string;
  time?: string;
  tags?: string[];
  ticketTiers?: { name: string; price: number }[];
}

export default function EventDetailsPage() {
  const { id } = useParams();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events");
        const data = await res.json();

        // Mock some extra fields if not present
        const selected = data.find(
          (e: any) =>
            e._id === id &&
            e.type !== "movie" &&
            e.type !== "concert"
        );

        if (!selected) throw new Error("Event not found");

        // Add mock data for demonstration
        selected.date = selected.date || "2026-05-15";
        selected.time = selected.time || "19:00";
        selected.ticketTiers =
          selected.ticketTiers ||
          [
            { name: "Regular", price: selected.price || 50 },
            { name: "VIP", price: (selected.price || 50) + 50 },
          ];
        selected.tags = selected.tags || ["Live", "Outdoor", "Music"];
        setEvent(selected);
      } catch (err) {
        console.log("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-lg text-muted-foreground">Loading event...</p>
      </div>
    );

  if (!event)
    return (
      <div className="text-center py-20 text-red-500">
        Event not found
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

      {/* Event Image */}
      <div className="relative w-full h-[450px] rounded-xl overflow-hidden shadow-lg">
        <Image
          src={event.image?.url || "https://images.unsplash.com/photo-1506157786151-b8491531f063"}
          alt={event.title}
          fill
          className="object-cover"
        />
        <Badge className="absolute top-3 left-3 capitalize bg-primary text-white">
          {event.type}
        </Badge>
      </div>

      {/* Event Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-4 flex-1">
          <h1 className="text-4xl font-bold">{event.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {event.rating && (
              <span className="text-yellow-500 font-medium">⭐ {event.rating}</span>
            )}
            <Badge className="capitalize">{event.type}</Badge>
            {event.tags?.map((tag) => (
              <Badge key={tag} className="bg-secondary text-white capitalize">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground text-lg">{event.description}</p>

          {/* Artists / Lineup */}
          {event.artists && event.artists.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-1">Artists / Lineup</h3>
              <ul className="list-disc list-inside">
                {event.artists.map((artist, i) => (
                  <li key={i}>{artist}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Venue */}
          {event.venues && event.venues.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-1">Venue</h3>
              <p className="text-muted-foreground">
                {event.venues[0].name}, {event.venues[0].city}
                {event.venues[0].address ? ` — ${event.venues[0].address}` : ""}
              </p>
            </div>
          )}

          {/* Date & Time */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-1">Date & Time</h3>
            <p className="text-muted-foreground">
              {event.date} at {event.time}
            </p>
          </div>
        </div>

        {/* Ticket Section */}
        <div className="flex flex-col gap-4 min-w-[200px]">
          <h2 className="text-2xl font-bold">Tickets</h2>

          {event.ticketTiers?.map((tier) => (
            <div
              key={tier.name}
              className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
            >
              <span className="font-medium">{tier.name}</span>
              <span className="font-semibold text-primary">${tier.price}</span>
              <Button 
                size="sm"
                onClick={() => {
                  // Navigate to book page with event details
                  window.location.href = `/events/${event._id}/book?tier=${encodeURIComponent(tier.name)}&price=${tier.price}`;
                }}
              >
                Book
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info / Description Highlights */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold">Event Highlights</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Exciting live performances by top artists</li>
          <li>Outdoor venue with great ambiance</li>
          <li>Multiple ticket tiers including VIP and Regular</li>
          <li>Food & beverages available onsite</li>
        </ul>
      </div>
    </div>
  );
}