'use client';

import { useEffect, useState, useMemo } from "react";
import { MovieCard } from "@/components/movie-card";
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

export default function MoviesPage() {
  const [movies, setMovies] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.EVENTS);
        const data: Event[] = await res.json();

        const moviesData = data.filter(
          (event) => event.type === "movie"
        );

        setMovies(moviesData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch movies.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Get unique genres from movies
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach((movie) => {
      movie.genres?.forEach((genre) => genres.add(genre.toLowerCase()));
    });
    return Array.from(genres).sort();
  }, [movies]);

  // Get unique languages from movies
  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    movies.forEach((movie) => {
      if (movie.language) languages.add(movie.language.toLowerCase());
    });
    return Array.from(languages).sort();
  }, [movies]);

  // Filter movies based on search and filters
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery || 
        movie.title.toLowerCase().includes(searchLower) ||
        movie.description?.toLowerCase().includes(searchLower) ||
        movie.director?.toLowerCase().includes(searchLower) ||
        movie.cast?.some(c => c.name.toLowerCase().includes(searchLower));

      // Genre filter
      const matchesGenre = 
        selectedGenre === "all" || 
        movie.genres?.some(g => g.toLowerCase() === selectedGenre);

      // Language filter
      const matchesLanguage = 
        selectedLanguage === "all" || 
        movie.language?.toLowerCase() === selectedLanguage;

      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [movies, searchQuery, selectedGenre, selectedLanguage]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenre("all");
    setSelectedLanguage("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedGenre !== "all" || selectedLanguage !== "all";

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-muted-foreground animate-pulse">
          Loading movies...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Movies
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search Input */}
          <Input
            placeholder="Search movies..."
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

          {/* Language Filter */}
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {availableLanguages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language.charAt(0).toUpperCase() + language.slice(1)}
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
              <button onClick={() => setSelectedGenre("all")} className="hover:text-destructive">×</button>
            </span>
          )}
          {selectedLanguage !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md">
              Language: {selectedLanguage}
              <button onClick={() => setSelectedLanguage("all")} className="hover:text-destructive">×</button>
            </span>
          )}
          <button 
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-destructive underline"
          >
            Clear all
          </button>
          <span className="text-sm text-muted-foreground ml-auto">
            Showing {filteredMovies.length} of {movies.length} movies
          </span>
        </div>
      )}

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No movies found matching your criteria.</p>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="mt-4 text-primary hover:underline"
            >
              Clear filters to see all movies
            </button>
          )}
        </div>
      ) : (
        <div
          className="
            grid 
            grid-cols-2 
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4 
            xl:grid-cols-5 
            gap-4 sm:gap-6
          "
        >
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              className="w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}

