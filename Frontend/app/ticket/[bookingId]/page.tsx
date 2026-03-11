'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Ticket, User } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/FireBase/FireBase';
import { API_ENDPOINTS } from '@/lib/api';

type BookingDetail = {
  _id: string;
  userId: string;
  eventId: string;
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

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);

        try {
          // Fetch user profile
          const userResponse = await fetch(
            API_ENDPOINTS.USER_BY_FIREBASE_ID(user.uid)
          );
          if (userResponse.ok) {
            const profileData = await userResponse.json();
            setUserProfile(profileData);
          }

          // Fetch booking details
          const bookingResponse = await fetch(
            `${API_ENDPOINTS.BOOKINGS}/booking/${bookingId}`
          );
          
          if (!bookingResponse.ok) {
            throw new Error('Booking not found');
          }
          
          const bookingData = await bookingResponse.json();
          setBooking(bookingData);
        } catch (err) {
          console.error(err);
          setError('Failed to load booking details');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Please login to view your tickets');
      }
    });

    return () => unsubscribe();
  }, [bookingId]);

  if (loading)
    return (
      <div className="container mx-auto px-4 md:px-6 py-10 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
      </div>
    );

  if (error || !booking)
    return (
      <div className="container mx-auto px-4 md:px-6 py-10">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/profile')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        <Card className="max-w-md mx-auto shadow-lg border border-red-200">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">{error || 'Unable to load booking'}</p>
            <Button className="w-full" onClick={() => router.push('/profile')}>
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="container mx-auto px-4 md:px-6 py-10">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/profile')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Profile
      </Button>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Ticket Card */}
        <Card className="shadow-xl overflow-hidden">
          {/* Ticket Header - Event Info */}
          <div className="bg-primary text-primary-foreground p-6 text-center">
            <Badge variant="secondary" className="mb-2">
              {booking.eventType === 'movie' ? 'Movie' : 'Concert'}
            </Badge>
            <h1 className="text-2xl font-bold">{booking.eventTitle}</h1>
            <p className="text-sm opacity-90 mt-1">
              {booking.eventStatus === 'upcoming' ? 'Upcoming Event' : 'Event Completed'}
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Event Date</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.eventDate 
                      ? new Date(booking.eventDate).toLocaleDateString()
                      : (booking.showtime 
                        ? new Date(booking.showtime).toLocaleDateString()
                        : 'Not specified')}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Show Time</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.showtime 
                      ? new Date(booking.showtime).toLocaleTimeString()
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Venue</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.theatreName || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Booked By</p>
                  <p className="text-sm text-muted-foreground">
                    {userProfile?.name || firebaseUser?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile?.email || firebaseUser?.email}
                  </p>
                </div>
              </div>

              {/* Booking Date */}
              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Booking Date</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.createdAt 
                      ? new Date(booking.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Seat Numbers */}
            {booking.seatNumbers && booking.seatNumbers.length > 0 && (
              <div>
                <p className="font-medium mb-2">Seat Numbers</p>
                <div className="flex flex-wrap gap-2">
                  {booking.seatNumbers.map((seat) => (
                    <Badge key={seat} variant="outline" className="text-lg px-3 py-1">
                      {seat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Payment & Ticket Info */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tickets</p>
                <p className="text-xl font-bold">{booking.ticketCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold">${booking.totalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge 
                  variant={booking.paymentStatus === 'completed' ? 'default' : 'destructive'}
                  className="mt-1"
                >
                  {booking.paymentStatus === 'completed' ? 'Paid' : 'Payment Pending'}
                </Badge>
              </div>
            </div>

            {/* Booking ID */}
            <div className="text-center text-sm text-muted-foreground pt-4">
              <p>Booking ID: <span className="font-mono">{booking._id}</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => router.push('/profile')}>
            View All Bookings
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              if (booking.eventType === 'movie') {
                router.push(`/movies/${booking.eventId}`);
              } else {
                router.push(`/concerts/${booking.eventId}`);
              }
            }}
          >
            View Event
          </Button>
        </div>
      </div>
    </div>
  );
}

