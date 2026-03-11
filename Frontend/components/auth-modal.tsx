'use client';

import { useState, useEffect } from 'react';
import { Github, Mail, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { doSignInWithGoogle, docreateUserWithEmailAndPassword, dosignInWithEmailAndPassword } from '@/FireBase/auth';
import { useAuth } from '@/contexts/authContexts';
import { API_ENDPOINTS } from '@/lib/api';

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Predefined options for preferences
const GENRE_OPTIONS = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 
  'Romance', 'Thriller', 'Documentary', 'Animation', 'Fantasy'
];

const LANGUAGE_OPTIONS = [
  'English', 'Spanish', 'French', 'German', 'Italian',
  'Japanese', 'Korean', 'Chinese', 'Portuguese', 'Russian'
];

const EVENT_TYPE_OPTIONS = [
  'Movie', 'Concert', 'Theater', 'Sports', 'Festival',
  'Comedy Show', 'Art Exhibition', 'Workshop', 'Conference', 'Networking'
];

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'preferences'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [city, setCity] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setMode('login');
      setName('');
      setEmail('');
      setPassword('');
      setCity('');
      setSelectedGenres([]);
      setSelectedLanguages([]);
      setSelectedEventTypes([]);
      setError('');
      setGoogleUser(null);
    }
  }, [open]);

  // Toggle genre selection
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  // Toggle language selection
  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language) 
        : [...prev, language]
    );
  };

  // Toggle event type selection
  const toggleEventType = (eventType: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(eventType) 
        ? prev.filter(et => et !== eventType) 
        : [...prev, eventType]
    );
  };

  // Check if user exists in backend
  const checkIfNewUser = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.USER_CHECK(email));
      const data = await response.json();
      return !data.exists; // Return true if user doesn't exist
    } catch (err) {
      console.error('Error checking user:', err);
      return true; // Default to treating as new user if check fails
    }
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await doSignInWithGoogle();
      const user = result.user;
      
      // Check if this is a new user
      const isNewUser = await checkIfNewUser(user.email!);
      
      if (isNewUser) {
        // Set up preference collection for new users
        setGoogleUser(user);
        setMode('preferences');
        setName(user.displayName || '');
        setEmail(user.email || '');
      } else {
        // Existing user - close modal
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // Save preferences for Google user
  const saveGoogleUserPreferences = async () => {
    if (!googleUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const userData = {
        name: googleUser.displayName || name,
        email: googleUser.email,
        city,
        preferences: {
          genres: selectedGenres,
          languages: selectedLanguages,
          eventTypes: selectedEventTypes
        },
        firebaseUid: googleUser.uid
      };

      const response = await fetch(API_ENDPOINTS.USERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save preferences');
      }

      alert(`Preferences saved successfully! Welcome, ${userData.name}`);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Signup handler
  const handleEmailSignup = async () => {
    setLoading(true);
    setError('');

    try {
      // Create user in Firebase
      const userCredential = await docreateUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      // Save user data to backend database
      const userData = {
        name,
        email,
        city,
        preferences: {
          genres: selectedGenres,
          languages: selectedLanguages,
          eventTypes: selectedEventTypes
        },
        firebaseUid: firebaseUser.uid
      };

      const response = await fetch(API_ENDPOINTS.USERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save user data');
      }

      alert(`Account created successfully! Welcome, ${name}`);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSigningIn) {
      setIsSigningIn(true);
      setLoading(true);
      try {
        await dosignInWithEmailAndPassword(email, password);
        alert(`Welcome back!`);
        onOpenChange(false);
      } catch (err: any) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
        setIsSigningIn(false);
      }
    }
  };

  // Handle form submission based on current mode
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      handleEmailSignup();
    } else if (mode === 'preferences') {
      saveGoogleUserPreferences();
    } else {
      handleLogin(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle>
            {mode === 'login' 
              ? 'Welcome Back' 
              : mode === 'signup' 
              ? 'Create an Account' 
              : 'Set Your Preferences'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Sign in to continue booking events'
              : mode === 'signup'
              ? 'Join Eventide and personalize your experience'
              : 'Tell us about your interests to get personalized recommendations'}
          </DialogDescription>
        </DialogHeader>

        {/* Social auth - only shown in login/signup modes */}
        {(mode === 'login' || mode === 'signup') && (
          <>
            <div className="space-y-3 mt-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                {mode === 'login'
                  ? 'Continue with Google'
                  : 'Sign up with Google'}
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <Github className="mr-2 h-4 w-4" />
                {mode === 'login'
                  ? 'Continue with GitHub'
                  : 'Sign up with GitHub'}
              </Button>
            </div>

            <div className="flex items-center gap-3 my-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="relative">
                <Input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="relative">
                <Input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

          {mode === 'preferences' && (
            <>
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Hello, {googleUser?.displayName || name}!
                </p>
                <p className="text-sm">Please tell us about your preferences:</p>
              </div>
              
              <div className="relative">
                <Input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              
              <Separator />
              
              {/* Genre Preferences */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Preferred Genres
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <div key={genre} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre}`}
                        checked={selectedGenres.includes(genre)}
                        onCheckedChange={() => toggleGenre(genre)}
                      />
                      <Label htmlFor={`genre-${genre}`} className="text-sm">
                        {genre}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Language Preferences */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Preferred Languages
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGE_OPTIONS.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${language}`}
                        checked={selectedLanguages.includes(language)}
                        onCheckedChange={() => toggleLanguage(language)}
                      />
                      <Label htmlFor={`lang-${language}`} className="text-sm">
                        {language}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Event Type Preferences */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Preferred Event Types
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPE_OPTIONS.map((eventType) => (
                    <div key={eventType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`event-${eventType}`}
                        checked={selectedEventTypes.includes(eventType)}
                        onCheckedChange={() => toggleEventType(eventType)}
                      />
                      <Label htmlFor={`event-${eventType}`} className="text-sm">
                        {eventType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}

        <Button
          className="w-full mt-6"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            'Processing...'
          ) : mode === 'login' ? (
            'Sign In'
          ) : mode === 'signup' ? (
            'Create Account'
          ) : (
            'Save Preferences'
          )}
        </Button>

        {/* Mode switching - only for login/signup */}
        {(mode === 'login' || mode === 'signup') && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {mode === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}{' '}
            <button
              className="text-primary font-medium hover:underline"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              type="button"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        )}

        {/* Cancel button for preferences mode */}
        {mode === 'preferences' && (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Skip for now
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
