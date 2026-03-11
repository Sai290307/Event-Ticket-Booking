import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Concert } from '@/lib/data';

interface ConcertCardProps {
  concert: Concert;
  className?: string;
}

export function ConcertCard({ concert, className }: ConcertCardProps) {
  
  return (
    <Card
      className={cn(
        'overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300',
        className
      )}
    >
      <CardContent className="p-0">
        <Link href={`/concerts/${concert._id}`} className="block group">
          <div className="relative aspect-video w-full">
            <Image
              src={concert.image?.url || ''}
              alt={`Image for ${concert.title}`}
              fill
              className="object-cover"
              data-ai-hint={concert.image?.hint || ''}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <div className="p-4">
          <h3 className="font-bold text-lg truncate mb-1 font-headline">
            <Link
              href={`/concerts/${concert._id}`}
              className="hover:text-primary transition-colors"
            >
              {concert.title}
            </Link>
          </h3>

          {/* Display all artists */}
          {concert.artists && concert.artists.length > 0 && (
            <p className="text-sm text-muted-foreground mb-2">
              {concert.artists.map(artist => artist.name).join(', ')}
            </p>
          )}

          <div className="text-sm text-muted-foreground space-y-1 mb-3">
            {concert.date && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(concert.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
            )}
            {concert.venue && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{concert.venue}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {concert.tags?.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
            {/* Display genres */}
            {concert.genres?.map(genre => (
              <Badge key={genre} variant="outline">{genre}</Badge>
            ))}
          </div>

          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link href={`/concerts/${concert._id}/book`}>
              <Ticket className="mr-2 h-4 w-4" />
              {concert.price ? `From $${concert.price}` : 'Book Tickets'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
