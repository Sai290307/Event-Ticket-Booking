'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Ticket, Music, Film, DollarSign, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/lib/api';

export default function HostEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'event',
    description: '',
    genres: '',
    language: '',
    price: '',
    imageUrl: '',
    imageHint: '',
    tags: '',
    // Event/Venue specific
    venueName: '',
    venueCity: '',
    eventDate: '',
    totalTickets: '',
    // Movie specific
    director: '',
    cast: '',
    // Concert specific
    artists: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare the event data
      const eventData = {
        title: formData.title,
        type: formData.type === 'event' ? 'event' : formData.type,
        description: formData.description,
        genres: formData.genres ? formData.genres.split(',').map((g) => g.trim()) : [],
        language: formData.language,
        price: formData.price ? parseFloat(formData.price) : 0,
        image: formData.imageUrl
          ? { url: formData.imageUrl, hint: formData.imageHint || 'event image' }
          : undefined,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        // Handle based on type
        ...(formData.type === 'movie'
          ? {
              director: formData.director,
              cast: formData.cast
                ? formData.cast.split(',').map((c) => {
                    const [name, role] = c.split(':');
                    return { name: name?.trim() || '', role: role?.trim() || 'Actor' };
                  })
                : [],
            }
          : {}),
        ...(formData.type === 'concert'
          ? {
              artists: formData.artists
                ? formData.artists.split(',').map((a) => {
                    const [name, role] = a.split(':');
                    return { name: name?.trim() || '', role: role?.trim() || 'Artist' };
                  })
                : [],
            }
          : {}),
        // Venue/Theatre info
        ...(formData.type === 'event'
          ? {
              venues: [
                {
                  name: formData.venueName,
                  city: formData.venueCity,
                  date: formData.eventDate ? new Date(formData.eventDate) : new Date(),
                  totalTickets: formData.totalTickets ? parseInt(formData.totalTickets) : 100,
                  ticketsSold: 0,
                },
              ],
            }
          : {}),
        ...(formData.type === 'movie'
          ? {
              theatres: [
                {
                  name: formData.venueName || 'Default Theatre',
                  city: formData.venueCity || 'Default City',
                  showtimes: ['10:00', '14:00', '18:00', '22:00'],
                  seatLayout: { rows: 10, seatsPerRow: 10 },
                  totalTickets: formData.totalTickets ? parseInt(formData.totalTickets) : 100,
                  ticketsSold: 0,
                },
              ],
            }
          : {}),
      };

      const response = await fetch(API_ENDPOINTS.CREATE_EVENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/events');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Host an Event</CardTitle>
              <CardDescription>Create and publish your own event, concert, or movie</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Ticket className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-600">Event Created Successfully!</h3>
              <p className="text-muted-foreground">Redirecting to events page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Event Type Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">Step 1</Badge>
                  Event Type
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('event')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.type === 'event'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Event</p>
                    <p className="text-xs text-muted-foreground">Comedy, Stand-up, etc.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('concert')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.type === 'concert'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Music className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Concert</p>
                    <p className="text-xs text-muted-foreground">Live Music</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('movie')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.type === 'movie'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Film className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Movie</p>
                    <p className="text-xs text-muted-foreground">Film Screening</p>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">Step 2</Badge>
                  Basic Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      name="language"
                      placeholder="e.g., English, Hindi"
                      value={formData.language}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your event..."
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genres">Genres (comma separated)</Label>
                    <Input
                      id="genres"
                      name="genres"
                      placeholder="e.g., Comedy, Drama, Action"
                      value={formData.genres}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="e.g., Live, Outdoor, Family Friendly"
                      value={formData.tags}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Tickets */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">Step 3</Badge>
                  Pricing & Tickets
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Ticket Price ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10"
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalTickets">Total Tickets</Label>
                    <Input
                      id="totalTickets"
                      name="totalTickets"
                      type="number"
                      min="1"
                      placeholder="100"
                      value={formData.totalTickets}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">Step 4</Badge>
                  Venue Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="venueName">
                      {formData.type === 'movie' ? 'Theatre Name' : 'Venue Name'}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="venueName"
                        name="venueName"
                        placeholder={formData.type === 'movie' ? 'Cineplex' : 'Madison Square Garden'}
                        className="pl-10"
                        value={formData.venueName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venueCity">City</Label>
                    <Input
                      id="venueCity"
                      name="venueCity"
                      placeholder="New York"
                      value={formData.venueCity}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Type-specific Fields */}
              {formData.type === 'movie' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Badge variant="outline">Step 5</Badge>
                    Movie Details
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="director">Director</Label>
                      <Input
                        id="director"
                        name="director"
                        placeholder="Christopher Nolan"
                        value={formData.director}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cast">Cast (comma separated: Name:Role)</Label>
                      <Input
                        id="cast"
                        name="cast"
                        placeholder="John Doe:Lead, Jane Smith:Supporting"
                        value={formData.cast}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'concert' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Badge variant="outline">Step 5</Badge>
                    Artist Details
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="artists">Artists (comma separated: Name:Role)</Label>
                    <Input
                      id="artists"
                      name="artists"
                      placeholder="Taylor Swift:Headliner, Ed Sheeran:Guest"
                      value={formData.artists}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">Step 6</Badge>
                  Event Image (Optional)
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        placeholder="https://images.unsplash.com/..."
                        className="pl-10"
                        value={formData.imageUrl}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageHint">Image Hint (for alt text)</Label>
                    <Input
                      id="imageHint"
                      name="imageHint"
                      placeholder="concert stage"
                      value={formData.imageHint}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Ticket className="mr-2 h-4 w-4" />
                      Create Event
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

