"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: any;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  return (
    <Link href={`/events/${event._id}`}>
      <Card
        className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}
      >
        <div className="relative h-60 w-full">
          <Image
            src={event.image?.url}
            alt={event.title}
            fill
            className="object-cover"
          />

          <Badge className="absolute top-3 left-3 capitalize">
            {event.type}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-2">
          <h3 className="text-lg font-semibold">{event.title}</h3>

          {event.venues?.length > 0 && (
            <p className="text-sm text-muted-foreground">
              📍 {event.venues[0].name}
            </p>
          )}

          {event.artists?.length > 0 && (
            <p className="text-sm text-muted-foreground">
              🎤 {event.artists.join(", ")}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex justify-between p-4 pt-0">
          <span className="font-semibold">${event.price}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}