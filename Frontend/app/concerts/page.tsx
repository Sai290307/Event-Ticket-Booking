'use client';

import { useEffect, useState, useMemo } from "react";
import { ConcertCard } from "@/components/concert-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { API_ENDPOINTS } from "@/lib/api";
import type { Concert } from "@/lib/data";

export default function ConcertsPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.EVENTS);
        const data: Concert[] = await res.json();

        const concertsData = data.filter(
          (event) => event.type === "concert"
        );

        setConcerts(concertsData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch concerts.");
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  // Get unique genres from concerts
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    concerts.forEach((concert) => {
      concert.genres?.forEach((genre) => genres.add(genre.toLowerCase()));
    });
    return Array.from(genres).sort();
  }, [concerts]);

  // Get unique cities from concerts
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    concerts.forEach((concert) => {
      if (concert.city) cities.add(concert.city.toLowerCase());
    });
    return Array.from(cities).sort();
  }, [concerts]);

  // Filter concerts based on search and filters
  const filteredConcerts = useMemo(() => {
    return concerts.filter((concert) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery || 
        concert.title.toLowerCase().includes(searchLower) ||
        concert.venue?.toLowerCase().includes(searchLower) ||
        concert.artists?.some(a => a.name.toLowerCase().includes(searchLower));

      // Genre filter
      const matchesGenre = 
        selectedGenre === "all" || 
        concert.genres?.some(g => g.toLowerCase() === selectedGenre);

      // City filter
      const matchesCity = 
        selectedCity === "all" || 
        concert.city?.toLowerCase() === selectedCity;

      return matchesSearch && matchesGenre && matchesCity;
    });
  }, [concerts, searchQuery, selectedGenre, selectedCity]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenre("all");
    setSelectedCity("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedGenre !== "all" || selectedCity !== "all";

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-muted-foreground text-lg animate-pulse">Loading concerts...</p>
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
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Concerts
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Search Input */}
          <Input
            placeholder="Search concerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />

          {/* Genre Filter */}
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {availableGenres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* City Filter */}
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md">
              {`Search: "${searchQuery}"`}
              <button onClick={() => setSearchQuery('')} className='hover:text-destructive'>×</button>
            </span>
          )}
          {selectedGenre !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md">
              Genre: {selectedGenre}
              <button onClick={() => setSelectedGenre('all')} className='hover:text-destructive'>×</button>
            </span>
          )}
          {selectedCity !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md">
              City: {selectedCity}
              <button onClick={() => setSelectedCity('all')} className='hover:text-destructive'>×</button>
            </span>
          )}
          <button 
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-destructive underline"
          >
            Clear all
          </button>
          <span className="text-sm text-muted-foreground ml-auto">
            Showing {filteredConcerts.length} of {concerts.length} concerts
          </span>
        </div>
      )}

      {/* Concerts Grid */}
      {filteredConcerts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No concerts found matching your criteria.</p>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="mt-4 text-primary hover:underline"
            >
              Clear filters to see all concerts
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredConcerts.map((concert) => (
            <ConcertCard
              key={concert._id}
              concert={concert}
              className="w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}

