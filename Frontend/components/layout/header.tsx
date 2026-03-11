"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ticket,
  Search,
  MapPin,
  User,
  Menu,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/contexts/authContexts";
import { doSignOut } from "@/FireBase/auth";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_ENDPOINTS } from "@/lib/api";

const navLinks = [
  { href: "/movies", label: "Movies" },
  { href: "/concerts", label: "Concerts" },
  { href: "/events", label: "Events" },
];

interface City {
  name: string;
  value: string;
}

export function Header() {
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("all");
  const [cities, setCities] = useState<City[]>([
    { name: "All Cities", value: "all" }
  ]);
  const [loadingCities, setLoadingCities] = useState(true);
  const auth = useAuth();
  const { userLoggedIn } = auth || { userLoggedIn: false };

  // Fetch available cities from events
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.EVENTS);
        const events = await response.json();
        
        // Extract unique cities from events
        const uniqueCities = new Set<string>();
        events.forEach((event: any) => {
          if (event.city) {
            uniqueCities.add(event.city);
          }
          // Also check in theatres and venues
          if (event.theatres) {
            event.theatres.forEach((theatre: any) => {
              if (theatre.city) uniqueCities.add(theatre.city);
            });
          }
          if (event.venues) {
            event.venues.forEach((venue: any) => {
              if (venue.city) uniqueCities.add(venue.city);
            });
          }
        });

        // Convert to city array with proper formatting
        const cityList: City[] = [
          { name: "All Cities", value: "all" },
          ...Array.from(uniqueCities).map(city => ({
            name: city.charAt(0).toUpperCase() + city.slice(1),
            value: city.toLowerCase()
          }))
        ];

        setCities(cityList);
      } catch (error) {
        console.error("Error fetching cities:", error);
        // Keep default cities if fetch fails
        setCities([
          { name: "All Cities", value: "all" },
          { name: "New York", value: "nyc" },
          { name: "San Francisco", value: "sf" },
          { name: "London", value: "lon" }
        ]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  const handleSignOut = async () => {
    try {
      await doSignOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    // Store city in localStorage for persistence
    localStorage.setItem("selectedCity", value);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("cityChanged", { detail: value }));
  };

  // Load saved city on mount
  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
      setSelectedCity(savedCity);
    }
  }, []);

  const renderNavLinks = (isMobile = false) =>
    navLinks.map((link) => (
      <Button
        key={link.href}
        variant="ghost"
        asChild
        className={cn(
          "text-foreground/70 hover:text-foreground hover:bg-transparent",
          pathname.startsWith(link.href) &&
            "font-bold text-primary hover:text-primary",
          isMobile && "justify-start text-lg w-full"
        )}
      >
        <Link href={link.href}>{link.label}</Link>
      </Button>
    ));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <div className="mr-6 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="font-headline">Eventide Tickets</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-4">
          <nav className="flex items-center gap-2">{renderNavLinks()}</nav>
        </div>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {/* Search */}
          <div className="relative w-full max-w-xs">
            <Input
              type="search"
              placeholder="Search movies, concerts..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>

          {/* City Select - Dynamic */}
          <Select 
            value={selectedCity} 
            onValueChange={handleCityChange}
            disabled={loadingCities}
          >
            <SelectTrigger className="w-[140px]">
              <MapPin className="mr-2 h-4 w-4" />
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Auth Section */}
          {userLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage
                    src={auth?.currentUser?.photoURL || ""}
                  />
                  <AvatarFallback>
                    {auth?.currentUser?.displayName
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {auth?.currentUser?.displayName ||
                    auth?.currentUser?.email}
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="cursor-pointer flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setAuthOpen(true)}>
              Login / Sign Up
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="ml-auto flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-2 font-bold text-lg mb-6">
                  <Ticket className="h-6 w-6 text-primary" />
                  <span className="font-headline">
                    Eventide Tickets
                  </span>
                </div>

                {/* Mobile Search */}
                <div className="relative w-full mb-4">
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>

                <nav className="flex flex-col gap-2 mb-4">
                  {renderNavLinks(true)}
                </nav>

                <div className="mt-auto flex flex-col gap-4">
                  {/* Mobile City Select - Dynamic */}
                  <Select 
                    value={selectedCity} 
                    onValueChange={handleCityChange}
                    disabled={loadingCities}
                  >
                    <SelectTrigger className="w-auto min-w-[140px]">
                      <MapPin className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {userLoggedIn ? (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={auth?.currentUser?.photoURL || ""}
                          />
                          <AvatarFallback>
                            {auth?.currentUser?.displayName
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span>Profile</span>
                      </Link>

                      <Button
                        onClick={handleSignOut}
                        variant="destructive"
                        className="w-full"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setAuthOpen(true)}
                      className="w-full"
                    >
                      Login / Sign Up
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
