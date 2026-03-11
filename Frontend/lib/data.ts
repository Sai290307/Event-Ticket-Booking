import { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder | undefined =>
  PlaceHolderImages.find((img) => img.id === id);

export interface Event {
  _id: string;
  title: string;
  genres: string[];
  language: string;
  rating: number;
  image: {
    url: string;
    hint: string;
  };
  description: string;
  showtimes: string[];
  seatLayout?: {
    rows: number;
    seatsPerRow: number;
  };
  trailer?: string;
  cast?: {
    _id: string;
    name: string;
    role: string;
  }[];
  director?: string;
  totalTickets?: number;
  ticketsSold?: number;
  city?: string;
  price?: number;
  artists?: {
    _id: string;
    name: string;
    role: string;
  }[];
  type?: string;
}


  export interface Concert {
  _id: string;
  title: string;
  type: 'concert';
  image: {
    url: string;
    hint: string;
  };
  artists?: {
    _id: string;
    name: string;
    role: string;
  }[];
  venue?: string;
  city?: string;
  date?: string;
  genres?: string[];
  price?: number;
  tags?: string[];
  totalTickets?: number;
  ticketsSold?: number;
  cast?: {
    _id: string;
    name: string;
    role: string;
  }[];
  showtimes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

