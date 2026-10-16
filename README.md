# 🚌 BusMS — Bus Management & Reservation System

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-REST_API-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**BusMS** is a full-stack Bus Management and Reservation System designed to simplify bus searching, seat reservations, schedule management, and passenger administration. It provides a responsive user interface for passengers and an administrative dashboard for managing buses, routes, schedules, bookings, and users.

Built with **React.js, Node.js, Express.js, and PostgreSQL**, the application demonstrates RESTful API development, relational database management, authentication, and full-stack deployment.

🌐 **Live Website:** [https://busms.vercel.app/](https://busms.vercel.app/)

📦 **GitHub Repository:** [BusMS](https://github.com/amankumar242323-png/BusMS)

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Database Design](#-database-design)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Environment Variables](#-environment-variables)
- [REST API Endpoints](#-rest-api-endpoints)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Future Enhancements](#-future-enhancements)
- [Learning Outcomes](#-learning-outcomes)
- [Author](#-author)
- [License](#-license)

---

## 🚀 About the Project

BusMS is developed to provide a centralized platform for managing bus transportation and reservation operations.

Passengers can search for buses, explore available routes and schedules, select seats, manage bookings, and access their tickets. Administrators can manage the bus fleet, routes, schedules, and booking records through a dedicated dashboard.

The project follows a **client-server architecture** in which the React frontend communicates with the Node.js and Express.js backend through REST APIs. PostgreSQL stores and manages the application's relational data.

### Project Objectives

- Simplify the bus search and reservation process.
- Provide centralized bus, route, and schedule management.
- Implement database-driven operations using PostgreSQL.
- Develop REST APIs for communication between frontend and backend.
- Provide authentication and role-based access for passengers and administrators.
- Build a responsive interface for desktop, tablet, and mobile devices.

## ✨ Key Features

### 👤 Passenger Features

- **User Registration and Login:** Create an account and authenticate securely.
- **Bus Search:** Search for buses based on source, destination, travel date, and bus type.
- **Route and Schedule Information:** Explore available routes, departure times, and arrival estimates.
- **Interactive Seat Selection:** View seat availability and select seats for a journey.
- **Booking Management:** Create reservations, view booking history, and cancel eligible bookings.
- **Payment Simulation:** Experience a checkout flow with supported payment method options and transaction records.
- **Digital Tickets:** View and print boarding tickets containing journey and seat details.
- **QR Code Tickets:** Generate QR codes for ticket identification and verification workflows.
- **Passenger Dashboard:** Access upcoming journeys, booking history, and cancelled reservations.
- **Notifications:** View booking confirmations, schedule updates, and payment-related alerts.

### 🛠️ Admin Dashboard

- **Dashboard Analytics:** View key statistics related to passengers, buses, bookings, and revenue.
- **Bus Management:** Add, view, update, and delete bus records.
- **Route Management:** Manage source cities, destinations, distances, and route pricing.
- **Schedule Management:** Create, update, and manage bus schedules.
- **Booking Management:** View and monitor reservation records.
- **User Management:** Access user information and manage administrative operations.
- **Role-Based Access:** Restrict administrative actions to authorized users.

### 📱 Responsive User Interface

- Responsive layouts for smartphones, tablets, and desktop computers.
- Mobile-friendly navigation and bus listing cards.
- Adaptive seat selection interface.
- Responsive dashboard statistics and management tables.
- Consistent forms, navigation, and page layouts.

## 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| JavaScript (ES6+) | Application logic |
| HTML5 | Page structure |
| CSS3 | Responsive styling |
| React Router DOM | Client-side navigation |
| Axios | HTTP requests and API integration |
| Node.js | Backend runtime |
| Express.js | REST API and server-side routing |
| PostgreSQL | Relational database |
| node-postgres (`pg`) | PostgreSQL connectivity and connection pooling |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| Git and GitHub | Version control and source code management |
| Vercel | Frontend deployment |
| Cloud PostgreSQL | Hosted database integration |

## 🏗️ System Architecture

BusMS follows a three-layer architecture.

```text
                 ┌────────────────────────┐
                 │      User / Admin      │
                 └────────────┬───────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │     React Frontend     │
                 │  UI, Forms, Navigation │
                 └────────────┬───────────┘
                              │
                       REST API / JSON
                              │
                              ▼
                 ┌────────────────────────┐
                 │   Node.js + Express    │
                 │ Routes, Auth, Logic    │
                 └────────────┬───────────┘
                              │
                         SQL Queries
                              │
                              ▼
                 ┌────────────────────────┐
                 │   PostgreSQL Database  │
                 │ Users, Buses, Bookings │
                 └────────────────────────┘
```

### Data Flow

1. The user interacts with the React frontend.
2. Axios sends HTTP requests to the Express backend.
3. The backend validates requests and applies application logic.
4. PostgreSQL executes the required queries.
5. The backend returns JSON responses to the frontend.
6. The frontend updates the interface based on the response.

## 🗄️ Database Design

The project uses PostgreSQL as its relational database.

The database schema is organized around the following tables:

| Table | Purpose |
|---|---|
| `users` | Passenger and administrator accounts |
| `bus` | Bus details, capacity, and driver information |
| `bus_amenity` | Amenities associated with buses |
| `route` | Source, destination, distance, and pricing |
| `schedule` | Bus assignments, journey dates, and timings |
| `booking` | Passenger reservations and booking status |
| `ticket` | Seat allocation and ticket information |
| `payment` | Payment transaction records and status |
| `alerts` | Passenger notifications and system alerts |

The schema uses relational constraints and foreign keys to maintain relationships between users, buses, routes, schedules, bookings, tickets, and payments.

### Database Files

- `schema.sql` — Defines database tables and constraints.
- `sample_data.sql` — Contains sample records for development and testing.

## 📂 Project Structure

```text
BusMS/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── alertRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── busRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── routeRoutes.js
│   │   └── scheduleRoutes.js
│   ├── utils/
│   │   └── dbCompat.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── schema.sql
├── sample_data.sql
├── .gitignore
└── README.md
```

*The directory structure above summarizes the main application files; individual files may vary as the project evolves.*

## ⚙️ Installation and Setup

Follow these steps to run BusMS locally.

### Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/) — v16 or higher
- [PostgreSQL](https://www.postgresql.org/download/) — v12 or higher
- [Git](https://git-scm.com/)
- npm, which is included with Node.js

### 1. Clone the Repository

```bash
git clone https://github.com/amankumar242323-png/BusMS.git
cd BusMS
```

### 2. Set Up PostgreSQL

Create a database named `bus_management`.

Using the PostgreSQL command-line tool:

```bash
psql -U postgres
```

Execute:

```sql
CREATE DATABASE bus_management;
```

Exit the PostgreSQL shell:

```sql
\q
```

Run the schema and sample data files from the project root:

```bash
psql -U postgres -d bus_management -f schema.sql
psql -U postgres -d bus_management -f sample_data.sql
```

Replace `postgres` with your PostgreSQL username if necessary.

If you use a cloud PostgreSQL provider, configure the hosted database connection details instead of your local credentials.

### 3. Configure and Start the Backend

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory using `.env.example` as a template.

Configure your PostgreSQL credentials and other required variables.

Start the backend:

```bash
npm run dev
```

If your backend `package.json` does not define a `dev` script, use the start command configured in that file, such as:

```bash
npm start
```

The backend should start on the configured port, typically `5000`.

### 4. Configure and Start the Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env` using `frontend/.env.example` as a template.

For local development, configure the backend URL:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the React application:

```bash
npm start
```

Open the application at:

[http://localhost:3000](http://localhost:3000)

**Important:** Restart the React development server whenever you change environment variables. The frontend environment variable above applies to Create React App; other build tools may use a different variable prefix.

## 🔐 Environment Variables

### Backend Configuration

Example `backend/.env`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_management
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:3000
```

These names must match the variables read by your backend code. If `db.js` uses `DATABASE_URL` instead of separate database fields, configure the connection string expected by that implementation.

### Frontend Configuration

Example `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

For production, replace the local backend address with your deployed backend API base URL.

**Security notes:**

- Never commit `.env` files or database credentials to GitHub.
- Keep `JWT_SECRET` private and use a strong production secret.
- Use HTTPS for production traffic.
- Configure database SSL and connection settings according to your PostgreSQL provider.
- Do not expose database passwords or privileged service credentials in frontend code.

## 🔌 REST API Endpoints

The following table summarizes the documented API routes. Endpoints marked as protected require the appropriate authentication and authorization.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a passenger |
| POST | `/api/auth/login` | Authenticate a user |

### Buses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/buses` | Retrieve buses |
| GET | `/api/buses/:id` | Retrieve a bus by ID |
| POST | `/api/buses` | Add a bus (Admin) |
| PUT | `/api/buses/:id` | Update a bus (Admin) |
| DELETE | `/api/buses/:id` | Delete a bus (Admin) |

### Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/routes` | Retrieve routes |
| POST | `/api/routes` | Create a route (Admin) |
| PUT | `/api/routes/:id` | Update a route (Admin) |
| DELETE | `/api/routes/:id` | Delete a route (Admin) |

### Schedules

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/schedules` | Search schedules |
| GET | `/api/schedules/:id` | Retrieve schedule details |
| GET | `/api/schedules/admin/all` | Retrieve all schedules (Admin) |
| POST | `/api/schedules` | Create a schedule (Admin) |
| PUT | `/api/schedules/:id` | Update a schedule (Admin) |
| DELETE | `/api/schedules/:id` | Delete a schedule (Admin) |

Schedule search supports query parameters such as `source`, `destination`, and `travel_date`, according to the backend implementation.

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a reservation |
| GET | `/api/bookings/me` | Retrieve the logged-in passenger's bookings |
| GET | `/api/bookings/admin/all` | Retrieve all bookings (Admin) |
| DELETE | `/api/bookings/:id` | Cancel a reservation |

### Payments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments` | Submit a payment request |
| GET | `/api/payments/history` | Retrieve payment history |

### Alerts and Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/alerts` | Retrieve user notifications |
| PUT | `/api/alerts/read-all` | Mark notifications as read |
| GET | `/api/admin/stats` | Retrieve administrative statistics |

**Note:** This is a documentation summary of the intended endpoints. Verify route registration, request parameters, response formats, and access rules against the current backend code before using these endpoints in external integrations.

## ☁️ Deployment

BusMS uses a split frontend/backend architecture that can be deployed to cloud platforms.

| Component | Deployment |
|---|---|
| Frontend | Vercel |
| Backend | Node.js-compatible hosting, such as Render |
| Database | PostgreSQL, including a hosted provider such as Supabase |

### Production Deployment Checklist

- Deploy the frontend and backend separately.
- Set the frontend API URL to the deployed backend.
- Configure backend database environment variables in the hosting dashboard.
- Connect the backend to the correct PostgreSQL database.
- Run `schema.sql` and, where appropriate, `sample_data.sql` against the intended database.
- Configure CORS to allow the deployed frontend origin.
- Verify that authentication, bus search, registration, and booking APIs work in production.
- Review backend logs and test database read/write operations.
- Never use local `localhost` database settings for a remotely hosted backend unless the database is running in the same environment.

### Live Application

Visit the deployed frontend:

**[BusMS — Live Website](https://busms.vercel.app/)**

The live application may require additional backend and database configuration to enable all features.

## 🧪 Testing

Use the following checklist when verifying the application:

- [ ] Frontend loads and navigation works.
- [ ] Backend API responds successfully.
- [ ] PostgreSQL connection is established.
- [ ] Bus search returns the expected records.
- [ ] Registration creates a user record.
- [ ] Login authenticates valid credentials.
- [ ] Invalid credentials are rejected.
- [ ] Seat availability and booking operations work correctly.
- [ ] Booking and payment records are stored as expected.
- [ ] Administrative CRUD operations enforce authorization.
- [ ] Tickets display the correct passenger, journey, and seat details.
- [ ] Production frontend can communicate with the deployed backend.

## 🔮 Future Enhancements

Potential improvements for future versions include:

- Integration with a real payment gateway such as Razorpay.
- Automated email and SMS notifications.
- Enhanced booking confirmation and ticket verification.
- More comprehensive automated unit and integration tests.
- Improved monitoring, logging, and production error reporting.
- Additional security checks and reservation concurrency testing.
- Advanced reporting and analytics for administrators.

## 🎓 Learning Outcomes

Developing BusMS provides practical experience with:

- Full-stack web application development.
- React component design and client-side routing.
- Node.js and Express REST API development.
- PostgreSQL schema design and relational data management.
- CRUD operations and SQL queries.
- Authentication, password hashing, and authorization.
- Frontend/backend integration using Axios.
- Environment configuration and cloud deployment.
- Debugging API, database, and deployment issues.

## 👨‍💻 Author

**Aman Kumar**

MCA Student | Full Stack Development Enthusiast

- GitHub: [amankumar242323-png](https://github.com/amankumar242323-png)
- Project: [BusMS Repository](https://github.com/amankumar242323-png/BusMS)
- Live Website: [busms.vercel.app](https://busms.vercel.app/)

## 📄 License

This project is distributed under the MIT License, subject to the license file included in the repository. See `LICENSE` for the applicable terms.

---

⭐ If you find this project useful, consider starring the repository!
