# 🚌 BusMS — Bus Management & Reservation System

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-REST_API-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**BusMS** is a full-stack Bus Management and Reservation System designed to simplify bus searching, seat reservations, schedule management, passenger administration, and online payments.

Built using **React.js, Node.js, Express.js, and PostgreSQL**, BusMS provides a responsive interface for passengers and an administrative dashboard for managing buses, routes, schedules, bookings, and users. The project also integrates **Razorpay** for payment processing.

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Project Objectives](#-project-objectives)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Database Design](#-database-design)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Environment Variables](#-environment-variables)
- [Razorpay Payment Integration](#-razorpay-payment-integration)
- [REST API Endpoints](#-rest-api-endpoints)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Security Considerations](#-security-considerations)
- [Future Enhancements](#-future-enhancements)
- [Learning Outcomes](#-learning-outcomes)
- [Author](#-author)
- [License](#-license)

---

## 🚀 About the Project

BusMS is a web-based application developed to provide a centralized platform for managing bus transportation and reservation operations.

Passengers can search for buses, explore routes and schedules, select seats, manage reservations, make payments, and access their tickets. Administrators can manage the bus fleet, routes, schedules, bookings, and users through a dedicated dashboard.

The application follows a **client-server architecture** in which the React frontend communicates with the Node.js and Express.js backend through REST APIs. PostgreSQL stores the application's relational data, while Razorpay provides payment gateway functionality.

### Project Objectives

- Simplify the bus search and reservation process.
- Provide centralized bus, route, and schedule management.
- Implement database-driven operations using PostgreSQL.
- Develop REST APIs for frontend-backend communication.
- Provide authentication and role-based access for passengers and administrators.
- Integrate Razorpay for online payment processing.
- Maintain payment transaction records and booking statuses.
- Build a responsive interface for desktop, tablet, and mobile devices.
- Deploy the application using cloud hosting platforms.

---

## ✨ Key Features

### 👤 Passenger Features

- **User Registration and Login:** Create an account and authenticate securely.
- **Bus Search:** Search for buses based on source, destination, travel date, and available criteria.
- **Route and Schedule Information:** Explore routes, departure times, and journey details.
- **Interactive Seat Selection:** View seat availability and select seats for a journey.
- **Booking Management:** Create reservations and view booking history.
- **Razorpay Payment Integration:** Use the integrated Razorpay payment gateway for checkout.
- **Payment Verification:** Verify payment responses through the backend before confirming a paid booking.
- **Payment History:** Access payment transaction records where supported by the application.
- **Digital Tickets:** View and print boarding tickets containing journey and seat details.
- **QR Code Tickets:** Support QR codes for ticket identification and verification workflows.
- **Passenger Dashboard:** Access booking history and journey information.
- **Notifications:** View booking confirmations and other supported alerts.

### 💳 Payment Features

- Razorpay payment gateway integration.
- Payment order creation through the backend.
- Razorpay Checkout for the payment process.
- Backend-side payment signature verification.
- PostgreSQL payment transaction records.
- Payment and booking status management.
- Support for Razorpay Test Mode during development.
- Separation of frontend checkout and backend payment verification.

**Note:** Actual payment methods, payment status handling, and confirmation behavior depend on the configured Razorpay account and the implemented backend routes.

### 🛠️ Admin Dashboard

- **Dashboard Analytics:** View available statistics related to passengers, buses, bookings, and revenue.
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

---

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
| node-postgres (`pg`) | Database connectivity and connection pooling |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| Razorpay | Payment gateway integration |
| Git and GitHub | Version control and source code management |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Cloud PostgreSQL | Hosted database integration |

---

## 🏗️ System Architecture

BusMS follows a three-layer architecture.

```text
              ┌─────────────────────────┐
              │      Passenger/Admin    │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │      React Frontend     │
              │ UI, Forms, Checkout     │
              └────────────┬────────────┘
                           │
                      REST API / JSON
                           │
                           ▼
              ┌─────────────────────────┐
              │    Node.js + Express    │
              │ Routes, Auth, Business  │
              │ Logic, Payment Verify   │
              └───────┬─────────┬───────┘
                      │         │
                      ▼         ▼
             ┌────────────┐  ┌────────────┐
             │ PostgreSQL │  │  Razorpay  │
             │  Database  │  │   Gateway  │
             └────────────┘  └────────────┘
```

### Data Flow

1. The passenger interacts with the React frontend.
2. Axios sends HTTP requests to the Express backend.
3. The backend validates requests and applies application logic.
4. PostgreSQL stores and retrieves application data.
5. For payments, the backend creates a Razorpay order.
6. Razorpay Checkout allows the passenger to complete the payment.
7. The backend verifies the payment response and updates the relevant records.
8. The frontend displays the appropriate payment and booking status.

---

## 🗄️ Database Design

BusMS uses PostgreSQL as its relational database.

The database schema is organized around the following tables:

| Table | Purpose |
|---|---|
| `users` | Passenger and administrator accounts |
| `bus` | Bus details, capacity, and related information |
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

**Important:** The table names and relationships described here should match the actual SQL schema in the repository.

---

## 📂 Project Structure

```text
BusMS/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   │
│   ├── routes/
│   │   ├── alertRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── busRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── routeRoutes.js
│   │   └── scheduleRoutes.js
│   │
│   ├── utils/
│   │   └── dbCompat.js
│   │
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
│   │
│   ├── .env.example
│   └── package.json
│
├── schema.sql
├── sample_data.sql
├── .gitignore
└── README.md
```

The directory structure summarizes the main application files. Individual files may vary as the project evolves.

---

## ⚙️ Installation and Setup

Follow these steps to run BusMS locally.

### Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/) — v16 or higher, compatible with the project's dependencies.
- [PostgreSQL](https://www.postgresql.org/download/) — v12 or higher.
- [Git](https://git-scm.com/).
- npm, which is included with Node.js.
- A Razorpay account for payment integration testing.

### 1. Clone the Repository

```bash
git clone https://github.com/amankumar242323-png/BusMS.git
cd BusMS
```

### 2. Set Up PostgreSQL

Create a database named `bus_management`.

Open PostgreSQL:

```bash
psql -U postgres
```

Create the database:

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

If you use a hosted PostgreSQL provider, configure the connection details required by that provider.

### 3. Configure and Start the Backend

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory using `.env.example` as a template.

Configure the database connection, authentication secret, frontend origin, and Razorpay credentials.

Start the backend:

```bash
npm run dev
```

If your `package.json` does not define a `dev` script, use the start command configured in that file:

```bash
npm start
```

The backend should start on its configured port, commonly `5000` during local development.

### 4. Configure and Start the Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env` using `frontend/.env.example` as a template.

For a Create React App configuration, set:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

Open the application at:

[http://localhost:3000](http://localhost:3000)

Restart the frontend development server whenever you change environment variables. Other frontend build tools may use a different environment-variable prefix.

---

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

RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

These variable names must match the configuration used by the backend. If `db.js` uses `DATABASE_URL` instead of separate database fields, configure the connection string expected by that implementation.

### Frontend Configuration

Example `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

Use the environment-variable prefix required by your frontend build tool.

For production, configure the frontend API URL to point to the deployed backend.

### Security Notes

- Never commit `.env` files or database credentials to GitHub.
- Keep `JWT_SECRET` private and use a strong production secret.
- Keep `RAZORPAY_KEY_SECRET` exclusively on the backend.
- Never expose privileged API secrets in frontend code.
- Use HTTPS for production traffic.
- Configure database SSL and connection settings according to your PostgreSQL provider.
- Restart or redeploy the relevant service after changing environment variables.

---

## 💳 Razorpay Payment Integration

BusMS integrates Razorpay to support online payment processing during the bus reservation process.

### Razorpay Setup

1. Create an account on [Razorpay](https://razorpay.com/).
2. Open the Razorpay Dashboard.
3. Enable **Test Mode** for development.
4. Generate your test API credentials.
5. Add the credentials to the backend environment variables.
6. Install the Razorpay Node.js SDK if it is not already installed.

From the backend directory:

```bash
npm install razorpay
```

### Payment Environment Variables

Add these variables to `backend/.env`:

```env
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Use the actual credentials generated in your Razorpay Dashboard. Never publish your key secret.

### Payment Workflow

The intended payment workflow is:

1. The passenger selects a bus and seats.
2. The application calculates the booking amount on the backend.
3. The backend creates a Razorpay order.
4. The frontend opens Razorpay Checkout using the returned order information.
5. The passenger completes or cancels the payment.
6. The frontend sends the payment response to the backend.
7. The backend verifies the payment signature and validates the related order and booking.
8. The backend updates the payment and booking records according to the verified result.
9. The passenger receives the appropriate booking status and ticket information.

### Payment API

The payment endpoints depend on the route implementation in `backend/routes/paymentRoutes.js`.

The following endpoints are a suggested structure. Use these paths only if they match the implemented backend:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/payments/create-order` | Create a Razorpay order |
| POST | `/api/payments/verify` | Verify the payment response |
| GET | `/api/payments/history` | Retrieve payment history |

### Payment Verification

Payment verification must happen on the backend.

The backend should:

- Validate the authenticated user and associated booking.
- Calculate the amount from trusted server-side booking data.
- Associate the Razorpay order with the correct booking.
- Verify the payment signature using the Razorpay key secret.
- Validate the amount, currency, order, and transaction status.
- Prevent duplicate processing of the same payment.
- Update payment and booking statuses only after appropriate verification.
- Handle failed, cancelled, pending, and successful payment states correctly.

A frontend success callback alone must never be treated as proof that a payment succeeded.

### Test Mode vs. Live Mode

**Test Mode**
- Intended for development and testing.
- Uses test credentials.
- Does not collect real customer payments when used correctly.

**Live Mode**
- Used for accepting actual customer payments.
- Requires the appropriate Razorpay account configuration and live credentials.
- Must be tested with production security, payment verification, and failure-handling measures.

For the official integration guide, visit the [Razorpay Standard Checkout documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/).

---

## 🔌 REST API Endpoints

The following table summarizes the documented API routes. Confirm the exact paths, methods, authentication requirements, and response formats against the current backend implementation.

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

Schedule search may support parameters such as `source`, `destination`, and `travel_date`, depending on the backend implementation.

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
| POST | `/api/payments/create-order` | Create a Razorpay order, if implemented |
| POST | `/api/payments/verify` | Verify payment details, if implemented |
| GET | `/api/payments/history` | Retrieve payment history, if implemented |

### Alerts and Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/alerts` | Retrieve user notifications |
| PUT | `/api/alerts/read-all` | Mark notifications as read |
| GET | `/api/admin/stats` | Retrieve administrative statistics |

**Note:** This API table is a documentation summary, not a guarantee that every listed route is registered. Check the route files and server configuration before relying on a particular endpoint.

---

## ☁️ Deployment

BusMS uses a split frontend/backend architecture that can be deployed to cloud platforms.

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | PostgreSQL hosted by the configured provider |
| Payment Gateway | Razorpay |

### Frontend Deployment on Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure the frontend root directory, such as `frontend`, if required by the repository structure.
4. Set the frontend API URL to the deployed backend.
5. Deploy the application.
6. Test navigation, authentication, bus search, booking, and payment checkout.

Configure the environment variable using the prefix required by your frontend build tool. For Create React App, this may be:

```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Backend Deployment on Render

1. Create a Render Web Service connected to the GitHub repository.
2. Configure the backend root directory if required.
3. Set the build and start commands according to `backend/package.json`.
4. Add the database environment variables.
5. Add `JWT_SECRET` and `FRONTEND_URL`.
6. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
7. Deploy the service and inspect its logs.
8. Verify that the backend can connect to PostgreSQL.

Do not commit production credentials to the repository.

### Production Deployment Checklist

- [ ] Deploy the frontend and backend separately.
- [ ] Set the frontend API URL to the deployed backend.
- [ ] Configure database environment variables in the hosting dashboard.
- [ ] Confirm that PostgreSQL connectivity is working.
- [ ] Apply the database schema to the correct database.
- [ ] Configure CORS to allow the deployed frontend origin.
- [ ] Verify authentication and bus search.
- [ ] Verify registration and booking operations.
- [ ] Configure Razorpay credentials securely.
- [ ] Test payment order creation and backend verification.
- [ ] Verify payment and booking status updates.
- [ ] Inspect backend logs for errors.
- [ ] Never expose secrets in browser code or public repositories.

### Live Application

Frontend: [BusMS — Live Website](https://bus-ms.vercel.app/)

Backend: [BusMS Backend](https://busms.onrender.com/)

The application may require additional backend, database, and environment configuration for all features to work correctly.

---

## 🧪 Testing

Use the following checklist when verifying the application.

### General Application Tests

- [ ] Frontend loads and navigation works.
- [ ] Backend API responds successfully.
- [ ] PostgreSQL connection is established.
- [ ] Bus search returns the expected records.
- [ ] Registration creates a user record.
- [ ] Login authenticates valid credentials.
- [ ] Invalid credentials are rejected.
- [ ] Seat availability and booking operations work correctly.
- [ ] Administrative CRUD operations enforce authorization.
- [ ] Tickets display the correct passenger, journey, and seat details.
- [ ] Production frontend communicates with the deployed backend.

### Razorpay Payment Tests

- [ ] Razorpay checkout opens with the expected order information.
- [ ] The amount is calculated and validated by the backend.
- [ ] Successful test payments are verified on the backend.
- [ ] Invalid payment signatures are rejected.
- [ ] Failed and cancelled payments do not incorrectly confirm bookings.
- [ ] Payment records are stored correctly in PostgreSQL.
- [ ] Duplicate verification does not create duplicate payment records.
- [ ] Booking and payment statuses remain consistent.
- [ ] Payment secrets are not exposed in frontend code or GitHub.
- [ ] Payment behavior is checked using Razorpay Test Mode before production use.

---

## 🔒 Security Considerations

- Store passwords using a secure password-hashing mechanism.
- Validate incoming requests on the backend.
- Apply authentication and authorization to protected endpoints.
- Keep database credentials and API secrets out of source control.
- Use HTTPS in production.
- Verify Razorpay payment signatures on the backend.
- Calculate payment amounts using trusted server-side booking data.
- Prevent duplicate payment processing and duplicate booking confirmation.
- Use database transactions where multiple related records must be updated together.
- Handle payment failures, timeouts, and delayed status updates safely.
- Consider Razorpay webhooks for reliable payment-status updates.
- Log errors without exposing secrets or sensitive payment information.

---

## 🔮 Future Enhancements

Potential improvements for future versions include:

- Razorpay webhook integration for payment-status reconciliation.
- Enhanced payment failure and retry handling.
- Automated email and SMS booking notifications.
- Improved booking confirmation and ticket verification.
- More comprehensive automated unit and integration tests.
- Improved monitoring, logging, and production error reporting.
- Stronger reservation concurrency and duplicate-booking protection.
- Advanced reporting and analytics for administrators.
- Improved passenger experience and mobile usability.

---

## 🎓 Learning Outcomes

Developing BusMS provides practical experience with:

- Full-stack web application development.
- React component design and client-side routing.
- Node.js and Express REST API development.
- PostgreSQL schema design and relational data management.
- CRUD operations and SQL queries.
- Authentication, password hashing, and authorization.
- Frontend/backend integration using Axios.
- Payment gateway integration with Razorpay.
- Payment signature verification and transaction handling.
- Environment configuration and cloud deployment.
- Debugging API, database, and deployment issues.

---

## 👨‍💻 Author

**Aman Kumar**

MCA Student | Full Stack Development Enthusiast

- GitHub: [amankumar242323-png](https://github.com/amankumar242323-png)
- Project Repository: [BusMS](https://github.com/amankumar242323-png/BusMS)

---

## 📄 License

This project is distributed under the MIT License, subject to the license file included in the repository. See `LICENSE` for the applicable terms.

---

⭐ If you find this project useful, consider starring the repository!