import Image from "next/image";
import Link from "next/link";
import { Star, Ticket } from "lucide-react";

import type { Event } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MovieCardProps {
  movie: Event;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300",
        className,
      )}
    >
      <CardContent className="p-0">
        <Link href={`/movies/${movie._id}`} className="block group">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={movie.image?.url} // fallback if missing
              alt={`Poster for ${movie.title}`}
              fill
              className="object-cover"
              data-ai-hint={movie.image?.hint || ""} // changed from posterHint
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        <div className="p-4">
          <h3 className="font-bold text-lg truncate mb-1 font-headline">
            <Link
              href={`/movies/${movie._id}`}
              className="hover:text-primary transition-colors"
            >
              {movie.title}
            </Link>
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
            <span>{movie.rating}/5</span>
            <span className="mx-2">·</span>
            <span>{movie.genres?.join(", ") || "N/A"}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{movie.language}</Badge>
          </div>
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link href={`/movies/${movie._id}/book`}>
              <Ticket className="mr-2 h-4 w-4" />
              Book Tickets
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
