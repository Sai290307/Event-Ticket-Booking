"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Users,
  Ticket,
} from "lucide-react";

type Artist = {
  _id: string;
  name: string;
  role?: string;
};

type Venue = {
  _id: string;
  name: string;
  city: string;
  date: string;
  totalTickets?: number;
  ticketsSold?: number;
};

type ConcertType = {
  _id: string;
  type: "concert";
  title: string;
  description: string;
  image?: { url: string };
  price?: number;
  rating?: number;
  tags?: string[];
  artists?: Artist[];
  showtimes?: string[];
  venues?: Venue[];
};

export default function ConcertDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [concert, setConcert] = useState<ConcertType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events");
        const data: ConcertType[] = await res.json();
        const selected = data.find(
          (e) => e.type === "concert" && e._id === params.id
        );
        if (!selected) throw new Error("Concert not found");
        setConcert(selected);
      } catch (err) {
        setError("Failed to load concert details.");
      } finally {
        setLoading(false);
      }
    };
    fetchConcert();
  }, [params.id]);

  if (loading)
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

  if (error || !concert)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-red-50 rounded-xl shadow-lg">
          <div className="text-5xl mb-4">🎵</div>
          <div className="text-2xl font-bold text-red-600 mb-2">Oops!</div>
          <div className="text-muted-foreground mb-6">{error || "Concert not found"}</div>
          <Button onClick={() => router.push("/concerts")} variant="outline">
            Browse Other Concerts
          </Button>
        </div>
      </div>
    );

  const firstVenue = concert.venues?.[0];
  const availableTickets =
    (firstVenue?.totalTickets ?? 0) - (firstVenue?.ticketsSold ?? 0);
  const isSoldOut = availableTickets <= 0;

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 text-muted-foreground">
      <h1 className="text-3xl font-semibold mb-8 text-primary">{concert.title}</h1>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Left: Large Image */}
        <div className="flex-1 rounded-lg overflow-hidden shadow-lg max-h-[400px] md:max-h-[450px] relative">
          {concert.image?.url ? (
            <Image
              src={concert.image.url}
              alt={concert.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="bg-gray-300 w-full h-full" />
          )}
        </div>

        {/* Right: Info Panel */}
        <aside className="w-full md:w-[360px] border border-gray-300 rounded-xl p-6 shadow-md flex flex-col justify-between bg-white">
          {/* Event Details */}
          <div className="space-y-5 text-gray-700">
            {/* Date */}
            {firstVenue && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-primary" />
                <time dateTime={firstVenue.date}>
                  {new Date(firstVenue.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
            )}

            {/* Time */}
            {concert.showtimes && concert.showtimes.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5 text-primary" />
                <span>{concert.showtimes[0]}</span>
              </div>
            )}

            {/* Duration - hardcoded, replace if available */}
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-primary" />
              <span>2 Hours</span>
            </div>

            {/* Age Limit */}
            <div className="flex items-center gap-3 text-sm">
              <Users className="w-5 h-5 text-primary" />
              <span>Age Limit - 5 yrs +</span>
            </div>

            {/* Language */}
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{concert.tags?.includes("Hindi") ? "Hindi" : "English"}</span>
            </div>

            {/* Genres / Tags */}
            {concert.tags && concert.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                {concert.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary text-white px-3 py-1 rounded-full font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Venue */}
            {firstVenue && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-primary" />
                <address className="not-italic">
                  {firstVenue.name}: {firstVenue.city}
                </address>
              </div>
            )}

            {/* Price */}
            <div>
              <p className="text-2xl font-bold text-primary">
                ₹{concert.price?.toLocaleString() || "900"} onwards
              </p>
              <p className="text-green-600 font-semibold">Available</p>
            </div>
          </div>

          {/* Book Now Button */}
          <Button
            size="lg"
            className="mt-6 rounded-full bg-primary hover:bg-primary/90 shadow-md text-white"
            onClick={() => router.push(`/concerts/${concert._id}/book`)}
            disabled={isSoldOut}
          >
            Book Now
          </Button>
        </aside>
      </div>

      {/* Tags below image (Concerts, Music Shows) */}
      <div className="mt-4 flex flex-wrap gap-2">
        {concert.tags?.map((tag) => (
          <span
            key={tag}
            className="text-xs font-semibold text-white bg-primary px-3 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Interested section */}
      <div className="mt-6 flex items-center gap-3 text-primary font-semibold">
        <span>👍 1.2k are interested</span>
        <Button variant="outline" className="text-primary border-primary">
          Im Interested
        </Button>
      </div>

      {/* About Section */}
      <section className="mt-10 max-w-4xl prose prose-primary">
        <h2>About The Event</h2>
        <p>
          Prepare for a night of pure musical power and ageless tunes as{" "}
          <strong>{concert.title}</strong> brings the house down across 10 cities
          in India, in association with <strong>Tribevibe</strong>.
        </p>
      </section>

      {/* Artists Section */}
      {concert.artists && concert.artists.length > 0 && (
        <section className="mt-12 max-w-4xl">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Performers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {concert.artists.map((artist) => (
              <div
                key={artist._id}
                className="bg-gradient-to-br from-primary/20 to-primary/10 p-5 rounded-xl shadow-md text-center cursor-default"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mb-3 select-none">
                  {artist.name.charAt(0)}
                </div>
                <p className="font-semibold text-primary">{artist.name}</p>
                {artist.role && (
                  <p className="text-sm text-muted-foreground mt-1">{artist.role}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}