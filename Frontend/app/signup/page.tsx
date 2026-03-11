'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Github, Mail, User, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function SignUpPage() {
  const [genres, setGenres] = useState('');
  const [languages, setLanguages] = useState('');
  const [eventTypes, setEventTypes] = useState('');
  const [favoriteActors, setFavoriteActors] = useState('');
  const [favoriteArtists, setFavoriteArtists] = useState('');

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Join Eventide and personalize your experience
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Social signup */}
          <div className="grid gap-3">
            <Button variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              Sign up with GitHub
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="relative">
              <Input placeholder="Full name" />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Input type="email" placeholder="Email address" />
            <Input type="password" placeholder="Password" />

            <div className="relative">
              <Input placeholder="City" />
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Separator />

          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Preferences
            </h3>

            <Input
              placeholder="Preferred Genres (comma separated)"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
            />

            <Input
              placeholder="Preferred Languages (comma separated)"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            />

            <Input
              placeholder="Preferred Event Types (movie, concert, etc.)"
              value={eventTypes}
              onChange={(e) => setEventTypes(e.target.value)}
            />
          </div>

          <Separator />

          {/* Favorites Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Favorites
            </h3>

            <Input
              placeholder="Favorite Actors (comma separated)"
              value={favoriteActors}
              onChange={(e) =>
                setFavoriteActors(e.target.value)
              }
            />

            <Input
              placeholder="Favorite Artists (comma separated)"
              value={favoriteArtists}
              onChange={(e) =>
                setFavoriteArtists(e.target.value)
              }
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full">
            Create Account
          </Button>

          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
