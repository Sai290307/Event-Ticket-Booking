'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Ticket, Lock, CheckCircle, ArrowLeft } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Get booking details from URL params
  const seats = searchParams.get('seats')?.split(',') || [];
  const showtime = searchParams.get('showtime') || '';
  const theatre = searchParams.get('theatre') || '';
  const tickets = searchParams.get('tickets') || '1';
  const eventName = searchParams.get('event') || 'Event';
  const venue = searchParams.get('venue') || '';

  // Calculate prices
  const SEAT_PRICE = 12.5;
  const ticketCount = seats.length > 0 ? seats.length : parseInt(tickets);
  const SERVICE_FEE = 2.5;
  const subtotal = ticketCount * SEAT_PRICE;
  const total = subtotal + SERVICE_FEE;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-10">
        <Card className="max-w-lg mx-auto text-center py-8">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
              <p className="text-muted-foreground mt-2">
                Your tickets have been booked successfully.
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-left">
              <p className="font-semibold">Booking Details:</p>
              <p className="text-sm text-muted-foreground mt-1">
                {seats.length > 0 
                  ? `Seats: ${seats.join(', ')}` 
                  : `${ticketCount} Ticket(s)`}
              </p>
              {showtime && <p className="text-sm text-muted-foreground">Time: {showtime}</p>}
              {(theatre || venue) && <p className="text-sm text-muted-foreground">Location: {theatre || venue}</p>}
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/profile">View My Bookings</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Payment */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>
                Complete your booking securely.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Event info */}
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">
                    {eventName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {showtime ? `${showtime}` : ''} {theatre || venue ? `· ${theatre || venue}` : ''}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Contact info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Contact Information</h3>
                <Input placeholder="Email address" type="email" />
              </div>

              {/* Payment */}
              <div className="space-y-4">
                <h3 className="font-semibold">Payment Details</h3>

                <div className="relative">
                  <Input
                    placeholder="Card number"
                    inputMode="numeric"
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="MM / YY" />
                  <Input placeholder="CVC" />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Secure payment · SSL encrypted
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-4">
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Cancel</Link>
              </Button>
              <Button 
                className="w-full" 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold mb-1">
                  {seats.length > 0 ? 'Selected Seats' : 'Tickets'}
                </p>
                {seats.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {seats.map((seat) => (
                      <Badge key={seat} variant="secondary">
                        {seat}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge variant="secondary">{ticketCount} Ticket(s)</Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>
                    Tickets ({ticketCount})
                  </span>
                  <span>
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Service fee</span>
                  <span>
                    ₹{SERVICE_FEE.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

