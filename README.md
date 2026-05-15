# BusMS - Bus Management System

Full-stack bus booking platform built with React, Node.js/Express, and PostgreSQL.

## Project Structure

```text
bus-management-system/
|-- backend/
|   |-- server.js
|   |-- .env.example
|   |-- package.json
|   |-- config/
|   |   `-- db.js
|   |-- middleware/
|   |   |-- auth.js
|   |   `-- errorHandler.js
|   `-- routes/
|       |-- authRoutes.js
|       |-- busRoutes.js
|       |-- routeRoutes.js
|       |-- scheduleRoutes.js
|       |-- bookingRoutes.js
|       |-- paymentRoutes.js
|       `-- alertRoutes.js
|-- frontend/
|   |-- package.json
|   `-- src/
|       |-- App.js
|       |-- App.css
|       |-- index.js
|       |-- context/
|       |   `-- AuthContext.js
|       |-- services/
|       |   `-- api.js
|       |-- components/
|       |   |-- Navbar.js
|       |   |-- Footer.js
|       |   |-- BusCard.js
|       |   `-- SeatSelector.js
|       `-- pages/
|           |-- Home.js
|           |-- Login.js
|           |-- Register.js
|           |-- SearchBus.js
|           |-- Booking.js
|           |-- Payment.js
|           |-- Ticket.js
|           |-- Dashboard.js
|           |-- AdminDashboard.js
|           |-- About.js
|           `-- Contact.js
|-- schema.sql
`-- sample_data.sql
```

## Setup

### 1. Database

```bash
psql -U postgres -c "CREATE DATABASE bus_management;"
psql -U postgres -f schema.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Set `REACT_APP_API_URL=http://localhost:5000/api` in the frontend `.env`.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Passenger | john@example.com | pass123 |
| Admin | admin@busms.com | pass123 |

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login and return JWT |
| GET | /api/buses | Public | List all buses |
| POST | /api/buses | Admin | Add bus |
| PUT | /api/buses/:id | Admin | Update bus |
| DELETE | /api/buses/:id | Admin | Delete bus |
| GET | /api/routes | Public | List routes |
| POST | /api/routes | Admin | Add route |
| GET | /api/schedules | Public | Search schedules |
| POST | /api/schedules | Admin | Add schedule |
| POST | /api/bookings | JWT | Create booking |
| GET | /api/bookings/me | JWT | My bookings |
| DELETE | /api/bookings/:id | JWT | Cancel booking |
| POST | /api/payments | JWT | Make payment |
| GET | /api/payments/history | JWT | Payment history |
| GET | /api/alerts | JWT | Notifications |
| GET | /api/admin/stats | Admin | Dashboard KPIs |
