"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

type CastMember = {
  name: string;
  role: string;
};

type Theatre = {
  name: string;
  city: string;
  showtimes: string[];
  totalTickets: number;
  ticketsSold: number;
};

type Movie = {
  _id: string;
  title: string;
  type: string;
  genres: string[];
  language: string;
  description: string;
  rating: number;
  price: number;
  image?: {
    url?: string;
  };
  cast: CastMember[];
  director: string;
  theatres: Theatre[];
  duration?: string;
  certificate?: string;
};

export default function MovieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTheatre, setSelectedTheatre] = useState<string | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events");
        const data: Movie[] = await res.json();

        const selectedMovie = data.find(
          (m) => m._id === params.id && m.type === "movie"
        );

        if (selectedMovie) setMovie(selectedMovie);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [params.id]);

  if (loading || !movie) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading Movie...
      </div>
    );
  }

  const totalAvailableSeats = movie.theatres.reduce(
    (acc, t) => acc + (t.totalTickets - t.ticketsSold),
    0
  );

  return (
    <div className="w-full bg-background pb-24">

      {/* HERO SECTION */}

      <div className="relative w-full bg-black text-white py-10 md:py-12">

        <div className="absolute inset-0">
          <Image
            src={movie.image?.url || "/placeholder.jpg"}
            alt={movie.title}
            fill
            className="object-cover blur-2xl brightness-50 scale-110"
          />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">

          {/* LEFT */}

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            <div className="w-[180px] sm:w-[200px] md:w-[220px] h-[260px] sm:h-[300px] md:h-[320px] relative rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={movie.image?.url || "/placeholder.jpg"}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-4 text-center sm:text-left">

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {movie.title}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">

                <div className="flex items-center gap-1 bg-black/50 px-3 py-1 rounded-lg">
                  <Star className="h-5 w-5 text-red-500 fill-red-500" />
                  <span>{movie.rating}/10</span>
                </div>

                <Button
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => {
                    if (!selectedTheatre || !selectedShowtime) {
                      alert("Select theatre and showtime");
                      return;
                    }

                    router.push(
                      `/movies/${movie._id}/book?theatre=${selectedTheatre}&time=${selectedShowtime}`
                    );
                  }}
                >
                  Book Tickets
                </Button>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm">

                {movie.certificate && (
                  <span className="bg-white/10 px-2 py-1 rounded">
                    {movie.certificate}
                  </span>
                )}

                {movie.duration && (
                  <span className="bg-white/10 px-2 py-1 rounded flex items-center gap-1">
                    <Clock size={14} /> {movie.duration}
                  </span>
                )}

                <span className="bg-white/10 px-2 py-1 rounded">
                  {movie.language}
                </span>

              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {movie.genres.map((g, i) => (
                  <span
                    key={i}
                    className="bg-white/10 px-3 py-1 rounded-full text-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>

            </div>
          </div>

          {/* TRAILER */}

          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">

            <iframe
              src="https://www.youtube.com/embed/TcMBFSGVi1c"
              title="Trailer"
              allowFullScreen
              className="w-full h-full"
            />

          </div>
        </div>
      </div>

      {/* ABOUT */}

      <div className="container mx-auto px-4 sm:px-6 mt-10">

        <h2 className="text-xl sm:text-2xl font-bold mb-3">
          About the movie
        </h2>

        <p className="text-muted-foreground max-w-3xl text-sm sm:text-base">
          {movie.description}
        </p>

      </div>

      {/* CAST */}

      <div className="container mx-auto px-4 sm:px-6 mt-12">

        <h2 className="text-xl sm:text-2xl font-bold mb-6">Cast</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">

          {movie.cast.map((member, i) => (

            <div
              key={i}
              className="bg-secondary p-4 rounded-xl text-center shadow"
            >

              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-primary text-white flex items-center justify-center text-lg sm:text-xl font-bold mb-3">
                {member.name.charAt(0)}
              </div>

              <p className="font-semibold text-sm sm:text-base">
                {member.name}
              </p>

              <p className="text-xs sm:text-sm text-muted-foreground">
                {member.role}
              </p>

            </div>

          ))}

        </div>

      </div>

      {/* THEATRES */}

      <div className="container mx-auto px-4 sm:px-6 mt-12">

        <h2 className="text-xl sm:text-2xl font-bold mb-6">
          Available Theatres
        </h2>

        <div className="space-y-6">

          {movie.theatres.map((theatre, i) => {

            const availableSeats =
              theatre.totalTickets - theatre.ticketsSold;

            return (

              <div
                key={i}
                className="border p-4 sm:p-6 rounded-xl shadow-sm"
              >

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <MapPin size={18} />
                  <h3 className="font-semibold text-base sm:text-lg">
                    {theatre.name}
                  </h3>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {theatre.city}
                  </span>
                </div>

                <p className="text-xs sm:text-sm mb-3 text-muted-foreground">
                  {availableSeats} seats available
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3">

                  {theatre.showtimes.map((time, t) => (

                    <Button
                      key={t}
                      variant={
                        selectedShowtime === time &&
                        selectedTheatre === theatre.name
                          ? "default"
                          : "outline"
                      }
                      onClick={() => {
                        setSelectedTheatre(theatre.name);
                        setSelectedShowtime(time);
                      }}
                      className="text-xs sm:text-sm"
                    >
                      {time}
                    </Button>

                  ))}

                </div>

              </div>

            );
          })}

        </div>
      </div>

      {/* FLOATING BOOK BUTTON */}

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6">

        <Button
          size="lg"
          className="shadow-xl bg-pink-600 hover:bg-pink-700"
          onClick={() => {
            if (!selectedTheatre || !selectedShowtime) {
              alert("Select theatre and showtime");
              return;
            }

            router.push(
              `/movies/${movie._id}/book?theatre=${selectedTheatre}&time=${selectedShowtime}`
            );
          }}
          disabled={totalAvailableSeats <= 0}
        >
          Book Now
        </Button>

      </div>

    </div>
  );
}