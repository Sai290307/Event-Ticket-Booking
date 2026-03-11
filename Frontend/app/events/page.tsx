'use client';

import { useEffect, useState, useMemo } from "react";
import { EventCard } from "@/components/event-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { API_ENDPOINTS } from "@/lib/api";
import type { Event } from "@/lib/data";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetch(API_ENDPOINTS.EVENTS)
      .then((res) => res.json())
      .then((data: Event[]) => {
        const filteredEvents = data.filter(
          (event) =>
            event.type !== "movie" &&
            event.type !== "concert"
        );
        setEvents(filteredEvents);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch events.");
        setLoading(false);
      });
  }, []);

  // Filter events based on search and type
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      const matchesType = filterType === "all" || event.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [events, searchQuery, filterType]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-muted-foreground text-lg">Loading events...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Events
        </h1>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="festival">Festival</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="theater">Theater</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="comedy">Comedy Show</SelectItem>
              <SelectItem value="art">Art Exhibition</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {searchQuery || filterType !== "all" 
            ? "No events found matching your search criteria." 
            : "No events found."}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              className="w-full"
            />
          ))}
        </div>
      )}

    </div>
  );
}

