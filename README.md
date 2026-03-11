# 🎫 TicketNet - Event Booking Platform

<p align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-blue" alt="Stack">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Version-1.0.0-orange" alt="Version">
</p>

TicketNet is a full-stack event booking platform for movies and concerts. It allows users to browse events, book tickets, view their booking history, and receive personalized recommendations. Event organizers can also host their own events.

## ✨ Features

### For Users
- 🔐 **Authentication** - Secure login/signup via Firebase (Google, GitHub, Email)
- 🎬 **Browse Events** - View movies and concerts listings
- 🎟️ **Book Tickets** - Select seats, choose showtimes, and purchase tickets
- 📱 **View Tickets** - Access booked tickets with QR code functionality
- 👤 **User Profile** - Manage account and view booking history
- 🤖 **Smart Recommendations** - Personalized event suggestions based on preferences and booking history

### For Event Hosts
- 📝 **Create Events** - Host movies or concerts with detailed information
- 🏷️ **Manage Listings** - Add genres, pricing, cast/artist details
- 📍 **Venue Management** - Configure theatres/showtimes or concert venues

### Technical Features
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS and Radix UI components
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔄 **Real-time Availability** - Seat availability checking
- 📊 **Recommendation Engine** - Content-based filtering algorithm

---

## 🏗️ Project Structure

```
tickenet2/
├── Backend/                    # Express.js Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── bookingController.js
│   │   │   ├── eventController.js
│   │   │   ├── recommendationController.js
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── Booking.js
│   │   │   ├── Event.js
│   │   │   ├── Interaction.js
│   │   │   └── user.js
│   │   ├── routes/
│   │   │   ├── bookingRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── recommendationRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/
│   │   │   └── recommendationService.js
│   │   └── server.js          # Main server entry point
│   └── package.json
│
├── Frontend/                   # Next.js Frontend Application
│   ├── app/                   # Next.js 13+ App Router
│   │   ├── checkout/
│   │   ├── concerts/
│   │   │   └── [id]/
│   │   │       └── book/
│   │   ├── events/
│   │   │   └── [id]/
│   │   │       └── book/
│   │   ├── host-event/
│   │   ├── login/
│   │   ├── movies/
│   │   │   └── [id]/
│   │   │       └── book/
│   │   ├── profile/
│   │   ├── signup/
│   │   ├── ticket/
│   │   │   └── [bookingId]/
│   │   ├── layout.tsx
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── layout/
│   │   │   └── header.tsx
│   │   ├── ui/                # Radix UI components
│   │   ├── auth-modal.tsx
│   │   ├── concert-card.tsx
│   │   ├── event-card.tsx
│   │   ├── event-section.tsx
│   │   └── movie-card.tsx
│   ├── contexts/
│   │   └── authContexts/      # Auth context providers
│   ├── FireBase/
│   │   ├── auth.ts
│   │   └── FireBase.ts
│   ├── lib/
│   │   ├── api.ts             # API endpoints
│   │   ├── data.ts            # Type definitions
│   │   └── utils.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
├── README.md
└── TODO.md
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| CORS | Cross-origin resource sharing |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 13+ | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Radix UI | UI component primitives |
| Firebase Auth | Authentication |
| Lucide React | Icon library |
| Embla Carousel | Carousel component |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas cloud)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tickenet2
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the Backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tickenet
   ```

   Create a `.env.local` file in the Frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```
   The API will run on `http://localhost:5000`

3. **Start Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

---

## 📡 API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create new user |
| GET | `/api/users/check?email=` | Check if user exists |
| GET | `/api/users/firebase/:firebaseUid` | Get user by Firebase UID |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get event by ID |
| POST | `/api/events` | Create new event |
| GET | `/api/events/:id/seats?showtime=` | Get available seats |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/user/:uid` | Get user's bookings |
| GET | `/api/bookings/event/:eventId` | Get bookings by event |
| GET | `/api/bookings/:id` | Get booking by ID |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations/:uid` | Get personalized recommendations |

---

## 📱 Pages Overview

| Route | Description |
|-------|-------------|
| `/` | Home page with hero, movies, and concerts |
| `/movies` | Browse all movies |
| `/movies/[id]` | Movie details |
| `/movies/[id]/book` | Book movie tickets |
| `/concerts` | Browse all concerts |
| `/concerts/[id]` | Concert details |
| `/concerts/[id]/book` | Book concert tickets |
| `/events` | Browse all events |
| `/events/[id]` | Event details |
| `/events/[id]/book` | Book event tickets |
| `/login` | User login |
| `/signup` | User registration |
| `/profile` | User profile & booking history |
| `/host-event` | Create/host new event |
| `/ticket/[bookingId]` | View booked ticket |
| `/checkout` | Checkout page |

---

## 🎯 Recommendation Algorithm

The recommendation system uses a content-based filtering approach:

```
Score = 0.4 × Popularity + 0.3 × Genre Match + 0.3 × Rating
```

- **Popularity**: Based on tickets sold percentage
- **Genre Match**: Matches user's preferred genres
- **Rating**: Event rating score

---

## 🔧 Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications for bookings
- [ ] Admin dashboard for event management
- [ ] Real-time seat selection with WebSocket
- [ ] Social features (reviews, ratings)
- [ ] Mobile app (React Native/Flutter)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Harshith** - [GitHub Profile](https://github.com)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Firebase](https://firebase.google.com/) - Authentication
- [MongoDB](https://www.mongodb.com/) - Database

