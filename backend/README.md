# MERNShop Backend — Final (All 9 Modules Combined)

Complete production-ready Express + MongoDB + TypeScript backend.
Fully wired to the MERN-II Next.js frontend.

## Tech Stack
- Node.js 20 + Express 4 + TypeScript 5
- MongoDB Atlas + Mongoose 8
- JWT (access 15min + refresh 7d with rotation)
- Socket.IO 4 (real-time order events)
- Nodemailer (order confirmation + password reset emails)
- Cloudinary (product image storage)
- Jest + Supertest (integration tests)
- Swagger UI (API documentation)
- Docker + Render (deployment)

## Quick Start
```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET

# 3. Seed data
npm run seed        # generate products.json from /data
npm run db:seed     # insert products into MongoDB
npm run db:admin    # create admin@mernshop.com / Admin@1234

# 4. Run
npm run dev         # http://localhost:5000
```

## All API Endpoints
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/health | — | Health + DB status |
| GET | /api/docs | — | Swagger UI |
| GET | /api/v1/products | — | List (paginated, filtered, sorted) |
| GET | /api/v1/products/stats | — | Category aggregation |
| GET | /api/v1/products/:id | — | Single product |
| POST | /api/v1/products | Admin | Create product |
| PUT | /api/v1/products/:id | Admin | Update product |
| DELETE | /api/v1/products/:id | Admin | Delete product |
| POST | /api/v1/products/:id/image | Admin | Upload to Cloudinary |
| GET | /api/v1/products/:id/reviews | — | Product reviews |
| POST | /api/v1/products/:id/reviews | Bearer | Submit review |
| DELETE | /api/v1/products/:id/reviews/:reviewId | Bearer | Delete own review |
| POST | /api/v1/auth/register | — | Create account |
| POST | /api/v1/auth/login | — | Login + get tokens |
| POST | /api/v1/auth/refresh | Cookie | Rotate access token |
| POST | /api/v1/auth/logout | — | Clear tokens |
| GET | /api/v1/auth/me | Bearer | Current user |
| POST | /api/v1/auth/forgot-password | — | Send reset email |
| POST | /api/v1/auth/reset-password | — | Reset with token |
| POST | /api/v1/orders | Bearer | Create order (transaction) |
| GET | /api/v1/orders/my | Bearer | My orders |
| GET | /api/v1/orders | Admin | All orders |
| PUT | /api/v1/orders/:id/status | Admin | Update status |

## Socket.IO Events
| Event | Direction | Description |
|-------|-----------|-------------|
| join:admin | Client→Server | Join admin room |
| join:user | Client→Server | Join user room |
| newOrder | Server→Admin | New order placed |
| orderConfirmed | Server→User | Order confirmed |
| orderStatusChanged | Server→User | Status updated |

## Frontend Wiring (MERN-II-wired/Final)
```bash
# Terminal 1 — Backend
cd MERN-III/Final
npm install && npm run seed && npm run db:seed && npm run db:admin && npm run dev

# Terminal 2 — Frontend
cd MERN-II-wired/Final
npm install && npm run dev
```

## Deploy
```bash
docker compose up --build       # local Docker
render up                      # Render production
```
