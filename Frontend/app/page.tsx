"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

import { MovieCard } from "@/components/movie-card";
import { ConcertCard } from "@/components/concert-card";
import { EventSection } from "@/components/event-section";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/corousel";
import { Button } from "@/components/ui/button";

import { auth } from "@/FireBase/FireBase";

import { API_ENDPOINTS } from "@/lib/api";

import type { Event } from "@/lib/data";
import type { Concert } from "@/lib/data";

export default function Home() {
  const [movies, setMovies] = useState<Event[]>([]);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Event[]>([]);
  const [recommendedConcerts, setRecommendedConcerts] = useState<Concert[]>([]);
  const [heroItems, setHeroItems] = useState<
    { imageUrl: string; description: string; imageHint: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [recommendationTitle, setRecommendationTitle] = useState("Popular Movies");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        let eventsData: Event[] = [];
        let recommendedData: Event[] = [];

        if (firebaseUser) {
          // Fetch personalized recommendations for logged-in users
          try {
            const recRes = await fetch(API_ENDPOINTS.RECOMMENDATIONS(firebaseUser.uid));
            if (recRes.ok) {
              recommendedData = await recRes.json();
              setRecommendationTitle("Recommended For You");
            }
          } catch (err) {
            console.log("Recommendations not available, using all events");
          }
        }

        // Always fetch all events
        const res = await fetch(API_ENDPOINTS.EVENTS);
        eventsData = await res.json();

        // If we have recommendations, use them; otherwise use all events
        const displayData = recommendedData.length > 0 ? recommendedData : eventsData;

        const moviesData = displayData.filter((event) => event.type === "movie");
        const concertsData = displayData.filter(
          (event) => event.type === "concert"
        ) as Concert[];

        // Also get all movies/concerts for the general sections
        const allMoviesData = eventsData.filter((event) => event.type === "movie");
        const allConcertsData = eventsData.filter(
          (event) => event.type === "concert"
        ) as Concert[];

        setMovies(allMoviesData);
        setConcerts(allConcertsData);
        setRecommendedMovies(moviesData);
        setRecommendedConcerts(concertsData);

        // Use recommendations or all events for hero section
        const heroData = displayData.length > 0 ? displayData : eventsData;
        setHeroItems(
          heroData.slice(0, 3).map((item) => ({
            imageUrl: item.image?.url || "",
            description: item.title,
            imageHint: item.image?.hint || "",
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [firebaseUser]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px] md:h-[500px] bg-gray-200">
            <p className="text-lg font-semibold animate-pulse">
              Loading events...
            </p>
          </div>
        ) : (
          <Carousel opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {heroItems.map((item, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[300px] md:h-[500px] w-full">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.description}
                        fill
                        priority={index === 0}
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-gray-300 w-full h-full flex items-center justify-center">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 container mx-auto p-4 md:p-12 text-white">
                      <h1 className="text-3xl md:text-5xl font-bold font-headline mb-4">
                        Your Next Event Awaits
                      </h1>
                      <Button size="lg" asChild>
                        <Link href="/movies">Explore Now</Link>
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 border-none text-white" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 border-none text-white" />
            </div>
          </Carousel>
        )}
      </section>

      {/* Events Sections */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg font-semibold animate-pulse">
              Loading movies & concerts...
            </p>
          </div>
        ) : (
          <>
            {/* Personalized Recommendations Section - Only show for logged in users with recommendations */}
            {firebaseUser && recommendedMovies.length > 0 && (
              <EventSection title={recommendationTitle} href="/movies">
                {recommendedMovies.slice(0, 6).map((movie) => (
                  <MovieCard
                    key={movie._id}
                    movie={movie}
                    className="w-[250px] flex-shrink-0"
                  />
                ))}
              </EventSection>
            )}

            <EventSection title="All Movies" href="/movies">
              {movies.map((movie) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  className="w-[250px] flex-shrink-0"
                />
              ))}
            </EventSection>

            <EventSection title="Upcoming Concerts" href="/concerts">
              {concerts.map((concert) => (
                <ConcertCard
                  key={concert._id}
                  concert={concert}
                  className="w-[300px] flex-shrink-0"
                />
              ))}
            </EventSection>
          </>
        )}
      </div>
    </div>
  );
}
