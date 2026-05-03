# 🛒 MERNShop

A full-stack e-commerce application built with the MERN stack — featuring a **Next.js 15** storefront, an **Express + MongoDB** REST API, real-time order updates via **Socket.IO**, and a fully functional **admin dashboard**.

---

## ✨ Features

### Storefront (Next.js Frontend)
- Product listing with search, category filtering, and sort options
- Product detail pages with image gallery and star ratings
- Authenticated product reviews
- Animated cart drawer with Zustand state management
- Wishlist functionality
- Responsive navbar with mobile menu and dark/light theme toggle
- Hero section with GSAP parallax animations and scroll-reveal effects
- Checkout flow with order placement
- User account management (profile, order history)
- Forgot/reset password and email verification flows

### Admin Dashboard
- Live order feed with real-time Socket.IO updates
- Revenue chart (Recharts)
- Stat cards (total orders, revenue, users, products)
- Full products table — create, edit, delete, and upload images to Cloudinary
- Orders management with status updates
- Users management
- Command palette for quick navigation

### Backend (Express API)
- RESTful API with versioned routes (`/api/v1/`)
- JWT authentication with access + refresh token rotation (stored in HTTP-only cookies)
- Email verification on signup and password reset via Nodemailer
- Role-based access control (`customer`, `admin`, `moderator`)
- Product image uploads via Multer + Cloudinary
- Real-time WebSocket events via Socket.IO
- Rate limiting, Helmet, CORS, HPP, and Mongo sanitization for security
- Zod schema validation on all inputs
- Swagger/OpenAPI docs at `/api/docs`
- Health check endpoint at `/api/health`
- Docker + Docker Compose support
- GitHub Actions CI/CD pipeline (lint → test → Docker build → deploy to Render)
- Jest test suite with MongoDB in-memory server

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Radix UI, shadcn/ui |
| Animations | Framer Motion, GSAP |
| State | Zustand, TanStack Query |
| Forms | React Hook Form, Zod |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Real-time | Socket.IO |
| File Storage | Cloudinary |
| Email | Nodemailer (SMTP) |
| API Docs | Swagger UI (swagger-jsdoc) |
| Testing | Jest, Supertest, mongodb-memory-server |
| DevOps | Docker, Docker Compose, GitHub Actions, Render |

---

## 📁 Project Structure

```
MERN-SHOP/
├── frontend/                  # Next.js 15 App Router
│   ├── app/
│   │   ├── (shop)/            # Customer-facing pages
│   │   ├── admin/             # Admin dashboard pages
│   │   └── auth/              # Auth pages (login, register, verify, reset)
│   ├── components/
│   │   ├── admin/             # Dashboard components (charts, tables, live feed)
│   │   ├── auth/              # Login & Register forms
│   │   ├── cart/              # Cart item rows, actions, clear button
│   │   ├── home/              # Hero, CTA, categories, stats bar
│   │   ├── layout/            # Navbar, footer, cart drawer, mobile menu
│   │   ├── products/          # Product card, grid, search, reviews
│   │   ├── ui/                # Shared UI primitives (button, badge, card…)
│   │   └── wishlist/          # Wishlist button
│   ├── stores/                # Zustand stores (cart, wishlist, auth, toast)
│   ├── hooks/                 # Custom hooks (useSocket)
│   ├── schemas/               # Zod validation schemas (client-side)
│   ├── lib/                   # Utilities (session, fonts, GSAP, metadata)
│   └── types/                 # Shared TypeScript types
│
└── backend/                   # Express REST API
    ├── src/
    │   ├── app.ts             # Express app setup (middleware, routes)
    │   ├── server.ts          # HTTP server + Socket.IO bootstrap
    │   ├── config/            # DB connection, Cloudinary, Swagger
    │   ├── controllers/       # Route handlers (auth, products, orders, users, reviews)
    │   ├── middleware/        # Auth guard, validation, error handler, upload, logger
    │   ├── models/            # Mongoose models (User, Product, Order, Review)
    │   ├── routes/            # Express routers
    │   ├── schemas/           # Zod schemas (server-side)
    │   ├── utils/             # JWT helpers, email sender
    │   ├── cli/               # DB seed scripts
    │   └── __tests__/         # Jest test suites
    ├── Dockerfile             # Multi-stage Docker build
    ├── docker-compose.yml     # API + MongoDB services
    └── .github/workflows/     # CI/CD pipeline
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local instance or MongoDB Atlas URI)
- A Cloudinary account (for image uploads)
- An SMTP provider (e.g. Gmail, Mailtrap) for emails

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/mernshop

# JWT
JWT_SECRET=your_jwt_secret_minimum_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_chars

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_password
SMTP_FROM=noreply@mernshop.com
```

**Start the development server:**

```bash
npm run dev
```

**Seed the database with sample products:**

```bash
npm run seed
```

**Create an admin user:**

```bash
npm run db:admin
```

The API will be running at `http://localhost:5000`.
Swagger docs: `http://localhost:5000/api/docs`

---

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**Start the development server:**

```bash
npm run dev
```

The storefront will be running at `http://localhost:3000`.

---

### Docker (Backend)

Run the API and MongoDB together using Docker Compose:

```bash
cd backend
docker-compose up --build
```

This starts:
- `mernshop-api` on port `5000`
- `mernshop-mongo` on port `27017`

---

## 🧪 Testing

```bash
cd backend
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

Tests use an in-memory MongoDB instance — no external database required. Test suites cover authentication, product CRUD, orders, and other core modules.

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | — | Register a new user |
| `POST` | `/api/v1/auth/login` | — | Login, returns access + refresh tokens |
| `GET` | `/api/v1/auth/verify-email` | — | Verify email via token |
| `POST` | `/api/v1/auth/forgot-password` | — | Send password reset email |
| `POST` | `/api/v1/auth/reset-password` | — | Reset password with token |
| `POST` | `/api/v1/auth/refresh` | — | Refresh access token |
| `POST` | `/api/v1/auth/logout` | ✅ | Logout and clear tokens |
| `GET` | `/api/v1/auth/me` | ✅ | Get current user profile |
| `PATCH` | `/api/v1/auth/me` | ✅ | Update profile |
| `DELETE` | `/api/v1/auth/me` | ✅ | Delete account |
| `POST` | `/api/v1/auth/change-password` | ✅ | Change password |
| `GET` | `/api/v1/products` | — | List products (filter, sort, search, paginate) |
| `GET` | `/api/v1/products/:id` | — | Get product by ID |
| `GET` | `/api/v1/products/stats` | — | Category stats |
| `POST` | `/api/v1/products` | 🔑 Admin | Create product |
| `PUT` | `/api/v1/products/:id` | 🔑 Admin | Update product |
| `DELETE` | `/api/v1/products/:id` | 🔑 Admin | Delete product |
| `POST` | `/api/v1/products/:id/image` | 🔑 Admin | Upload product image |
| `GET` | `/api/v1/products/:id/reviews` | — | Get product reviews |
| `POST` | `/api/v1/products/:id/reviews` | ✅ | Submit a review |
| `DELETE` | `/api/v1/products/:id/reviews/:reviewId` | 🔑 Admin | Delete a review |
| `POST` | `/api/v1/orders` | ✅ | Place an order |
| `GET` | `/api/v1/orders/my` | ✅ | Get my orders |
| `GET` | `/api/v1/orders/:id` | ✅ | Get order by ID |
| `GET` | `/api/v1/orders` | 🔑 Admin | Get all orders |
| `GET` | `/api/v1/orders/stats` | 🔑 Admin | Order aggregate stats |
| `PUT` | `/api/v1/orders/:id/status` | 🔑 Admin | Update order status |
| `DELETE` | `/api/v1/orders/:id` | 🔑 Admin | Delete order |
| `GET` | `/api/v1/users` | 🔑 Admin | List all users |
| `GET` | `/api/health` | — | Health check |

Full interactive docs available at `/api/docs` (Swagger UI).

---

## ⚡ Real-time Events (Socket.IO)

| Event (Client → Server) | Description |
|---|---|
| `join:admin` | Join the admin room to receive live order updates |
| `join:user` | Join a user-specific room for personal notifications |

Order status changes and new orders are broadcast to connected admin clients in real time.

---

## 🚢 Deployment

### Backend (Render)

The project includes a `render.json` configuration. Set all environment variables in your Render service dashboard (same as the `.env` table above).

CI/CD via GitHub Actions automatically:
1. Runs TypeScript type-check and Jest tests
2. Builds the Docker image
3. Deploys to Render on merge to `main`

### Frontend (Vercel / Render)

Deploy the `frontend/` directory to Vercel or any platform that supports Next.js. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` to your deployed backend URL.

---

## 📝 License

MIT
