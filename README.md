# BusMS — Bus Management & Reservation System

[![Node.js Version](https://img.shields.io/badge/Node.js-v16+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18.2.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v12+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express-v4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

BusMS is an enterprise-ready, full-stack bus management and reservation platform designed for intercity travel across India. Built with **React 18**, **Node.js/Express**, and **PostgreSQL**, BusMS delivers a fluid booking experience across **smartphones, tablets, and laptops**, paired with a full-fledged administrative command center for managing fleets, routes, schedules, and reservations.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
  - [Passenger Experience](#passenger-experience)
  - [Administrative Portal](#administrative-portal)
- [Cross-Device Responsive Design](#cross-device-responsive-design)
- [Technology Stack](#technology-stack)
- [System Architecture & Data Flow](#system-architecture--data-flow)
- [Database Schema & Models](#database-schema--models)
- [Project Directory Structure](#project-directory-structure)
- [Installation & Quick Start](#installation--quick-start)
  - [Prerequisites](#prerequisites)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Opening on Mobile / Tablet (Local Wi-Fi)](#4-opening-on-mobile--tablet-local-wi-fi)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [Self-Healing & Reliability Features](#self-healing--reliability-features)
- [Troubleshooting & FAQs](#troubleshooting--faqs)
- [Project Team](#project-team)
- [License](#license)

---

## About the Project

Intercity bus travel often suffers from fragmented booking workflows, expired schedule data, unresponsive mobile layouts, and a lack of real-time seat transparency.

**BusMS** was engineered from the ground up to solve these problems by providing:
1. **Interactive Visual Seat Selection**: Real-time visual seat map showing available, selected, and booked seats.
2. **Smart Schedule Engine**: Auto-shifts expired schedules forward into upcoming dates, preventing empty searches and stale data.
3. **Adaptive Cross-Device UI**: Seamless aspect ratios tailored for smartphones (compact drawer navigation, mobile action bars), tablets (fluid multi-column cards), and desktop screens (expansive dashboards).
4. **Local Network Portability**: Built-in LAN IP resolution that lets you run the server locally and test reservations from physical iPhones, Androids, or iPads over Wi-Fi without cloud redeployments.
5. **Secure Authentication & RBAC**: JWT-secured sessions with bcrypt hashing, passenger role segregation, and admin authorization middleware.

---

## Key Features

### Passenger Experience

- **Search & Discovery**:
  - Filter buses by **Source**, **Destination**, **Travel Date**, and **Bus Type** (AC Sleeper, AC Seater, Non-AC, Luxury Volvo).
  - Flexible route fallbacks: If no exact date matches, upcoming trips along that corridor are recommended.
  - Quick-reset and clear filter toggles.
- **Seat Map & Reservation**:
  - Live interactive seating grid with clear indicators for *Available*, *Selected*, and *Booked* seats.
  - Select up to 6 seats per transaction.
  - Responsive horizontal scrolling for seamless browsing on touch screens without clipping.
- **Simulated Payment Gateway**:
  - Multiple payment methods: **Credit/Debit Card** (with formatting & CVV validation), **UPI** (GPay, PhonePe, Paytm), and **Net Banking**.
  - Immediate receipt generation with unique transaction identifiers (`TXN-...`).
- **Digital Tickets & QR Verification**:
  - Printable boarding passes displaying passenger details, seat numbers, journey times, and fare breakdown.
  - Dynamically generated QR code on every ticket for quick validation by bus conductors.
- **Passenger Dashboard**:
  - View all reservations categorized by **Upcoming**, **All**, and **Cancelled**.
  - One-click booking cancellation with automated payment status updates (`refunded`/`cancelled`).
- **Real-Time Notification Alerts**:
  - In-app notification center for booking confirmations, schedule updates, and payment alerts.

### Administrative Portal

- **Executive KPI Dashboard**:
  - Real-time aggregate statistics: Total Registered Passengers, Active Fleet Size, Total Bookings, and Total System Revenue.
- **Fleet Management**:
  - Register new buses with registration numbers, bus categories, seating capacities, driver assignments, and onboard amenities.
  - Decommission buses with safety cascade checks.
- **Route Planning**:
  - Configure corridors by defining source cities, destination cities, distance in kilometers, and base price per kilometer.
- **Schedule Dispatcher**:
  - Create trips by assigning buses to designated routes with specific travel dates, departure times, and arrival estimates.
  - Toggle trip status between `active`, `inactive`, and `completed`.
- **Global Booking Audit**:
  - Live ledger of all platform bookings, passenger assignments, and transaction statuses.

---

## Cross-Device Responsive Design

BusMS implements a tailored design system optimized for modern screen ratios:

| Device Category | Target Viewports | Key Optimizations |
|---|---|---|
| **Mobile Phones** | 320px – 640px | Animated hamburger drawer menu, vertical bus cards with sticky bottom-action booking bar, 16px input font (prevents iOS safari auto-zoom), unclipped horizontal seat scroll, 2-column stats. |
| **Tablets & iPads** | 768px – 1024px | 2-column grid collapses, responsive navigation with notification pill, horizontal scrollable tables with `min-width: 620px` to maintain data clarity. |
| **Laptops & Desktops** | > 1024px | Full 4-column KPI analytics, multi-column search bars, persistent sidebar summaries, split journey & seat reservation layout. |

---

## Technology Stack

### Frontend
- **Framework**: [React 18.2.0](https://reactjs.org/) (Create React App)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/) with request/response interceptors for automatic JWT attachment and 401 redirection
- **Styling**: Modern Vanilla CSS Design System with CSS variables, fluid typography (`clamp()`), and media queries (No Tailwind bloat)
- **Icons & QR**: Native Unicode emojis, Google Fonts (*Syne* & *Plus Jakarta Sans*), QRServer API

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v16+)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database Driver**: [node-postgres (`pg`)](https://node-postgres.com/) with connection pooling
- **Security & Auth**: [JSON Web Tokens (`jsonwebtoken`)](https://jwt.io/), [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **CORS Handling**: `cors` package configured with dynamic local network (LAN) IP regex matcher

### Database
- **Engine**: [PostgreSQL 12+](https://www.postgresql.org/)
- **Architecture**: Relational schema with foreign keys, composite constraints, and transaction sequences

---

## System Architecture & Data Flow

```text
  [ Smartphone / Tablet / Laptop ]
                 │
                 ▼  (HTTP / REST JSON)
     ┌────────────────────────┐
     │   React 18 Frontend    │
     │  (Port 3000 / LAN IP)  │
     └───────────┬────────────┘
                 │
                 │ Axios Interceptors (JWT Bearer Token)
                 ▼
     ┌────────────────────────┐
     │   Express.js Backend   │
     │  (Port 5000 / LAN IP)  │
     ├────────────────────────┤
     │ • CORS LAN Matcher     │
     │ • JWT Auth & RBAC      │
     │ • Route Controllers    │
     │ • Auto Date Reloader   │
     └───────────┬────────────┘
                 │
                 │ pg Pool (SQL Queries)
                 ▼
     ┌────────────────────────┐
     │  PostgreSQL Database   │
     │   (bus_management)     │
     └────────────────────────┘
```

---

## Database Schema & Models

The system relies on 9 relational tables:

```text
users ───────────< booking >─────────── schedule ──────────> route
                      │                    │
                      ├───< ticket         └───────────────> bus ───< bus_amenity
                      │
                      └───< payment
```

1. **`users`**: Stores passenger and administrator profiles, credentials (bcrypt hashes), roles (`passenger` / `admin`), and contact information.
2. **`bus`**: Stores fleet assets with `bus_number`, `bus_type`, total `capacity`, and `driver_name`.
3. **`bus_amenity`**: Normalized amenities associated with buses (`AC`, `WiFi`, `Charging Point`, `Blanket`, etc.).
4. **`route`**: Geographic corridors with `source`, `destination`, `distance` (km), and `price_per_km`.
5. **`schedule`**: Scheduled trips linking a `bus` and `route` with `travel_date`, `departure_time`, `arrival_time`, `available_seats`, and `status`.
6. **`booking`**: Reservations created by passengers with total fare, passenger count, and reservation status (`confirmed`, `pending`, `cancelled`).
7. **`ticket`**: Individual seat allotments assigned under a booking record.
8. **`payment`**: Payment transaction logs tracking `amount`, `payment_method`, `payment_status`, and gateway timestamps.
9. **`alerts`**: User notification inbox for booking receipts, journey confirmations, and system announcements.

---

## Project Directory Structure

```text
busms/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool with SSL/port fallbacks
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & isAdmin role enforcement
│   │   └── errorHandler.js       # Centralized HTTP error handler
│   ├── routes/
│   │   ├── alertRoutes.js        # Notification feeds & read toggles
│   │   ├── authRoutes.js         # User registration & login endpoints
│   │   ├── bookingRoutes.js      # Reservation creation & cancellation logic
│   │   ├── busRoutes.js          # Fleet management CRUD
│   │   ├── paymentRoutes.js      # Checkout simulation & payment logging
│   │   ├── routeRoutes.js        # Corridor management CRUD
│   │   └── scheduleRoutes.js     # Schedule search with date roll-forward logic
│   ├── utils/
│   │   └── dbCompat.js           # Sequence sync, demo hash repair & schedule refresh
│   ├── .env                      # Backend environment config (PORT, DB credentials)
│   ├── .env.example              # Sample environment template
│   ├── package.json              # Backend dependencies and scripts
│   └── server.js                 # Express application entry point & CORS configuration
├── frontend/
│   ├── public/
│   │   ├── index.html            # HTML5 shell with viewport & manifest settings
│   │   └── manifest.json         # PWA metadata
│   ├── src/
│   │   ├── components/
│   │   │   ├── BusCard.js        # Responsive trip card with booking action
│   │   │   ├── Footer.js         # Responsive 4-column footer
│   │   │   ├── Navbar.js         # Sticky header with mobile hamburger drawer
│   │   │   └── SeatSelector.js   # Visual seating grid with aisle layout
│   │   ├── context/
│   │   │   └── AuthContext.js    # Global user session & JWT state provider
│   │   ├── pages/
│   │   │   ├── About.js          # Mission & team presentation
│   │   │   ├── AdminDashboard.js # Management center for buses, routes & metrics
│   │   │   ├── Booking.js        # Journey details & seat selection view
│   │   │   ├── Contact.js        # Support inquiry page
│   │   │   ├── Dashboard.js      # Passenger journey hub & cancellation portal
│   │   │   ├── Home.js           # Landing page with corridor search & stats
│   │   │   ├── Login.js          # Sign-in form with network error alerts
│   │   │   ├── Payment.js        # Multi-option checkout form
│   │   │   ├── Register.js       # Passenger signup form
│   │   │   ├── SearchBus.js      # Bus search page with live filters & fallbacks
│   │   │   └── Ticket.js         # Boarding pass view with print & QR code
│   │   ├── services/
│   │   │   └── api.js            # Axios client with dynamic local/LAN detection
│   │   ├── App.css               # Central responsive design system
│   │   ├── App.js                # App route definitions & protected routes
│   │   └── index.js              # React DOM mounting entry point
│   ├── .env                      # Frontend environment config (REACT_APP_API_URL)
│   ├── .env.example              # Sample frontend environment config
│   └── package.json              # Frontend dependencies and scripts
├── .gitignore                    # Root git exclusions
├── sample_data.sql               # Seed routes, buses, users, and schedules
└── schema.sql                    # PostgreSQL table definitions & constraints
```

---

## Installation & Quick Start

### Prerequisites

Ensure you have the following software installed on your machine:
- **Node.js**: v16.x or higher ([Download Node.js](https://nodejs.org/))
- **PostgreSQL**: v12.x or higher ([Download PostgreSQL](https://www.postgresql.org/download/))
- **Git**: ([Download Git](https://git-scm.com/))

---

### 1. Database Setup

1. Open your terminal or `psql` shell:
   ```bash
   psql -U postgres
   ```
2. Create the database:
   ```sql
   CREATE DATABASE bus_management;
   \q
   ```
3. Load the schema and sample seed data:
   ```bash
   psql -U postgres -d bus_management -f schema.sql
   psql -U postgres -d bus_management -f sample_data.sql
   ```

---

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
4. Verify your `backend/.env` file matches your local PostgreSQL configuration:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bus_management
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   JWT_SECRET=super_secret_jwt_key_change_in_production
   FRONTEND_URL=http://localhost:3000
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   > You will see:
   > ```text
   > BusMS Backend running on port 5000
   > Database sequences synchronized
   > Refreshed X expired schedule date(s) to upcoming days
   > ```

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
4. Ensure your `frontend/.env` points to the backend port:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```
5. Start the React development server:
   ```bash
   npm start
   ```
   > The application will open automatically in your browser at `http://localhost:3000`.

---

### 4. Opening on Mobile / Tablet (Local Wi-Fi)

To test the responsive layout on a physical phone or tablet connected to the same Wi-Fi network:

1. Find your computer's local Wi-Fi IP address:
   - **Windows**: Run `ipconfig` in Command Prompt (look for *IPv4 Address*, e.g., `192.168.1.15`).
   - **macOS / Linux**: Run `ifconfig` or `ip a` (look for `inet 192.168.x.x`).
2. On your phone or tablet browser, visit:
   ```text
   http://192.168.x.x:3000
   ```
3. **No extra config needed**: The frontend dynamically routes API requests to `http://192.168.x.x:5000`, and the backend CORS automatically allows private LAN origins!

---

## Demo Credentials

The database comes pre-seeded with sample accounts for immediate testing:

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@busms.com` | `pass123` | Full access to Admin Dashboard, Fleet, Routes, Schedules & System KPIs |
| **Passenger** | `john@example.com` | `pass123` | Search, Seat Selection, Payment, My Bookings & Boarding Tickets |
| **Passenger** | `jane@example.com` | `pass123` | Search, Seat Selection, Payment, My Bookings & Boarding Tickets |

---

## API Reference

### Authentication
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `{ name, email, phone, password }` | Register a new passenger account |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticate user and receive JWT token |

### Buses (Fleet)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/buses` | Public | None | Retrieve all buses in the fleet |
| `GET` | `/api/buses/:id` | Public | None | Retrieve specific bus details |
| `POST` | `/api/buses` | Admin | `{ bus_number, bus_type, capacity, driver_name, amenities }` | Register a new bus |
| `PUT` | `/api/buses/:id` | Admin | Bus attributes | Update bus information |
| `DELETE` | `/api/buses/:id` | Admin | None | Delete a bus from fleet |

### Routes (Corridors)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/routes` | Public | None | List all available intercity routes |
| `POST` | `/api/routes` | Admin | `{ source, destination, distance, price_per_km }` | Create a new route |
| `PUT` | `/api/routes/:id` | Admin | Route attributes | Update route details |
| `DELETE` | `/api/routes/:id` | Admin | None | Remove a route |

### Schedules (Trips)
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/schedules` | Public | `?source=&destination=&travel_date=` | Search schedules with automatic date recovery |
| `GET` | `/api/schedules/admin/all`| Admin | None | Retrieve all schedules (active, inactive, past) |
| `GET` | `/api/schedules/:id` | Public | None | Retrieve single trip schedule with booked seats |
| `POST` | `/api/schedules` | Admin | `{ bus_id, route_id, travel_date, departure_time, arrival_time }` | Create a new trip schedule |
| `PUT` | `/api/schedules/:id` | Admin | Trip attributes & status | Modify schedule timings or status |
| `DELETE` | `/api/schedules/:id` | Admin | None | Delete a schedule |

### Bookings & Tickets
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/api/bookings` | JWT | `{ schedule_id, seats_booked, seat_numbers }` | Reserve seats on a schedule |
| `GET` | `/api/bookings/me` | JWT | None | Get logged-in passenger's booking history |
| `GET` | `/api/bookings/admin/all`| Admin | None | Audit all platform bookings |
| `DELETE`| `/api/bookings/:id` | JWT | None | Cancel reservation and refund payment |

### Payments
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/api/payments` | JWT | `{ booking_id, amount, payment_method }` | Process payment and issue digital ticket |
| `GET` | `/api/payments/history`| JWT | None | Retrieve passenger's payment transaction logs |

### Alerts & Analytics
| Method | Endpoint | Access | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/alerts` | JWT | None | Retrieve notifications for current user |
| `PUT` | `/api/alerts/read-all` | JWT | None | Mark all unread alerts as read |
| `GET` | `/api/admin/stats` | Admin | None | Retrieve high-level revenue and usage KPIs |

---

## Self-Healing & Reliability Features

BusMS contains built-in self-healing utilities in `backend/utils/dbCompat.js` that execute automatically when the server starts up:

1. **Automatic Schedule Rollover (`refreshExpiredScheduleDates`)**:
   - In standard databases, sample schedules inserted with `CURRENT_DATE + 1` expire once the calendar advances past the seed day.
   - BusMS automatically shifts expired schedule dates to future days (`CURRENT_DATE + 1` through `CURRENT_DATE + 7`), ensuring your search page **always** displays live buses.
2. **Database Sequence Auto-Sync (`syncCoreSequences`)**:
   - Manually seeding rows with explicit integer primary keys can cause PostgreSQL sequences to fall behind, triggering duplicate key violations on new inserts.
   - On startup, BusMS synchronizes all PostgreSQL table sequences with the current `MAX(id) + 1`.
3. **Demo Password Hash Repair (`repairDemoPasswordHashes`)**:
   - Verifies and repairs legacy demo password hashes to guarantee that `admin@busms.com` and `john@example.com` can authenticate cleanly using `pass123`.

---

## Troubleshooting & FAQs

### Q1: Login fails with "Cannot connect to backend server"
- Ensure your backend terminal is running (`npm run dev` in `backend`).
- Verify that `frontend/.env` contains `REACT_APP_API_URL=http://localhost:5000` and restart the frontend server (`npm start`).

### Q2: Searching buses returns "No buses found"
- BusMS automatically refreshes expired seed dates. If you recently added custom schedules in the past, restart the backend or click **"Show All Available Buses"** on `/search` to view upcoming active departures.

### Q3: When accessing from phone or tablet, the screen is blank or errors out
- Ensure your phone and laptop are on the same Wi-Fi network.
- Confirm you are visiting `http://<YOUR_LAPTOP_IP>:3000` (e.g. `http://192.168.1.15:3000`), not `localhost:3000`.

### Q4: PostgreSQL connection error `password authentication failed for user "postgres"`
- Open `backend/.env` and update `DB_PASSWORD` to match your local PostgreSQL master password.
- Verify PostgreSQL service is running on port 5432.

---

## Project Team

Developed with passion by:
- **Aman Kumar** — *Project Lead & Backend Engineer*
- **Abhishek Yadav** — *Full Stack Developer*
- **Nandini Kanaujiya** — *Frontend Engineer*
- **Radhika Verma** — *UI/UX Designer*
- **Shraiyansh Chaware** — *Database Administrator*

---

## License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it for academic or commercial purposes.
