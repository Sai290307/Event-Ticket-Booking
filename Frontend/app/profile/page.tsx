'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, MapPin, Ticket, Calendar } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { auth } from '@/FireBase/FireBase';
import { API_ENDPOINTS } from '@/lib/api';

type Booking = {
  _id: string;
  eventId: string;
  userId: string;
  ticketCount: number;
  totalAmount: number;
  showtime?: string;
  eventDate?: string;
  theatreName?: string;
  seatNumbers?: string[];
  createdAt: string;
  eventTitle: string;
  eventType?: string;
  paymentStatus?: 'completed' | 'payment_pending';
  eventStatus?: 'upcoming' | 'completed';
};

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  city: string;
  firebaseUid: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);

        try {
          // Fetch user profile from backend
          const userResponse = await fetch(
            API_ENDPOINTS.USER_BY_FIREBASE_ID(user.uid)
          );
          if (userResponse.ok) {
            const profileData = await userResponse.json();
            setUserProfile(profileData);
          }

          // Fetch bookings
          const response = await fetch(
            API_ENDPOINTS.BOOKINGS_BY_USER(user.uid)
          );
          if (!response.ok) throw new Error('Failed to fetch bookings');
          const userBookings = await response.json();
          setBookings(userBookings);
        } catch (err) {
          console.error(err);
          setError('Failed to load bookings');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="container mx-auto px-4 md:px-6 py-10 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
      </div>
    );

  if (error || !firebaseUser)
    return (
      <div className="container mx-auto px-4 md:px-6 py-10">
        <Card className="max-w-md mx-auto shadow-lg border border-red-200">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">{error || 'Unable to load profile'}</p>
            <Button className="w-full" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  // Separate upcoming and past bookings based on eventStatus from backend
  const upcomingTickets = bookings.filter(b => b.eventStatus === 'upcoming').slice(0, 3);
  const pastBookings = bookings.filter(b => b.eventStatus === 'completed');

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 space-y-8">
      <div className="grid gap-8 md:grid-cols-3">
        {/* User Info Card */}
        <Card className="md:col-span-1  text-black shadow-lg">
          <CardHeader className="items-center text-center space-y-2">
            <Avatar className="h-24 w-24 border-2 border-white">
              <AvatarFallback className="text-2xl font-bold">
                {userProfile?.name
                  ? userProfile.name.charAt(0)
                  : firebaseUser.displayName
                  ? firebaseUser.displayName.charAt(0)
                  : firebaseUser.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{userProfile?.name || firebaseUser.displayName || 'User'}</CardTitle>
            <CardDescription>🎟️ Ticket Enthusiast</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-black">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 opacity-80" />
              <span>{firebaseUser.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 opacity-80" />
              <span>{userProfile?.city || 'Location not specified'}</span>
            </div>

            <Separator className="border-white/50" />

            <Button 
              className="w-full border-white text-white transition-colors"
              onClick={() => router.push('/host-event')}
            >
              🎉 Host Event
            </Button>
            <Button className="w-full border-white text-white transition-colors">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Tickets Section */}
        <div className="md:col-span-2 space-y-8">
          {/* Upcoming Tickets */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Upcoming Tickets</CardTitle>
              <CardDescription>Your next events & movies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTickets.length > 0 ? (
                upcomingTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => router.push(`/ticket/${ticket._id}`)}
                    className="border-l-4 border-primary p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-lg transition cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-lg">{ticket.eventTitle}</p>
                        {ticket.eventType && (
                          <Badge variant="secondary">{ticket.eventType}</Badge>
                        )}
                        {ticket.eventStatus && (
                          <Badge 
                            variant={ticket.eventStatus === 'upcoming' ? 'default' : 'outline'}
                            className={ticket.eventStatus === 'upcoming' ? 'bg-green-500' : ''}
                          >
                            {ticket.eventStatus}
                          </Badge>
                        )}
                        {ticket.paymentStatus && (
                          <Badge 
                            variant={ticket.paymentStatus === 'completed' ? 'default' : 'destructive'}
                          >
                            {ticket.paymentStatus === 'completed' ? 'Payment Completed' : 'Payment Pending'}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {ticket.eventDate 
                          ? new Date(ticket.eventDate).toLocaleDateString()
                          : (ticket.showtime || 'Date not specified')}
                        {ticket.theatreName && ` · ${ticket.theatreName}`}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Booked on:{' '}
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>

                    {ticket.seatNumbers && ticket.seatNumbers.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {ticket.seatNumbers.map((seat) => (
                          <Badge key={seat} variant="outline">
                            {seat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="mx-auto h-12 w-12 mb-2 opacity-60" />
                  <p>No upcoming tickets</p>
                  <p className="text-sm mt-1">Book your next event!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Bookings */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Past Bookings</CardTitle>
              <CardDescription>Events you&apos;ve already attended</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <div
                    key={booking._id}
                    onClick={() => router.push(`/ticket/${booking._id}`)}
                    className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-80 hover:shadow-md transition cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{booking.eventTitle}</p>
                        {booking.eventType && (
                          <Badge variant="secondary">{booking.eventType}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {booking.eventDate 
                          ? new Date(booking.eventDate).toLocaleDateString()
                          : (booking.createdAt
                          ? new Date(booking.createdAt).toLocaleDateString()
                          : 'Date not available')}
                        {booking.theatreName && ` · ${booking.theatreName}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.ticketCount} ticket(s)</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-2 opacity-60" />
                  <p>No past bookings yet</p>
                  <p className="text-sm mt-1">
                    Your booking history will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}