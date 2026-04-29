# MERNShop — MERN-II Final Assembly

> **Live frontend** built with Next.js 15, TypeScript, Tailwind CSS, Zustand, TanStack Query, Recharts, Framer Motion, and cmdk. Ready to deploy on Vercel and connect to the MERN-III Express + MongoDB backend.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env.local

# 3. Run development server
npm run dev
```

Visit `http://localhost:3000`

---

## All Modules Wired Together

| Module | Status | Key Files |
|---|---|---|
| **ProductCard** | ✅ | `components/products/ProductCard.tsx` |
| **Search** | ✅ | `components/products/SearchBar.tsx` → URL-driven with debounce |
| **Cart** | ✅ | `stores/cartStore.ts` · `app/actions/cart.ts` · `app/api/cart/route.ts` |
| **Wishlist** | ✅ | `stores/wishlistStore.ts` · `components/wishlist/WishlistButton.tsx` |
| **Auth UI** | ✅ | `components/auth/LoginForm.tsx` · `components/auth/RegisterForm.tsx` |
| **Admin Dashboard** | ✅ | `app/admin/` · `components/admin/` |

---

## Route Map

```
/                     → Home (hero, featured products, feature cards)
/products             → Product listing (search + filter + sort + streaming)
/products/[id]        → Product detail (image gallery, add to cart, wishlist)
/cart                 → Cart page — protected (requires session)
/checkout             → Checkout form — protected (requires session)
/account              → Account page — protected (requires session)
/auth/login           → Customer login (RHF + Zod validation)
/auth/register        → Register (RHF + Zod + password strength meter)
/admin/login          → Admin login (split-screen, sets mernshop_admin cookie)
/admin                → Dashboard (stat cards + revenue chart + live feed)
/admin/products       → Products table (TanStack Table: sort/filter/paginate)
/admin/orders         → Live order feed (useSocket + Framer Motion)
/admin/users          → Users (placeholder for MERN-III)
/sitemap.xml          → Auto-generated sitemap
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Yes | `http://localhost:3000` | App URL (used for absolute fetches) |
| `NEXT_PUBLIC_APP_NAME` | No | `MERNShop` | App display name |
| `NEXT_PUBLIC_API_URL` | MERN-III | — | Express backend URL (e.g. Render) |
| `DATABASE_URL` | MERN-III | — | MongoDB connection string |
| `NEXTAUTH_SECRET` | MERN-IV | — | NextAuth.js secret (min 32 chars) |
| `NEXTAUTH_URL` | MERN-IV | — | Full app URL for NextAuth callbacks |
| `SKIP_ENV_VALIDATION` | CI only | — | Set `true` to skip t3-env validation |

### Setting env vars on Vercel

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add each variable from `.env.example`
3. For MERN-II deploy: only `NEXT_PUBLIC_BASE_URL` is required
4. Redeploy after adding variables

---

## Auth Flow

```
Customer flow:
  /auth/register → fill form (Zod: email, password min 8, passwords match)
               → success → redirect /auth/login
  /auth/login   → fill form → loginAction() sets mern_cart cookie
               → middleware grants access to /cart, /checkout, /account

Admin flow:
  /admin/login  → click Sign In → sets mernshop_admin cookie (httpOnly)
               → middleware grants access to all /admin/** routes
               → sidebar logout clears the cookie → back to /admin/login
```

### Protected Routes (middleware.ts)

| Route | Cookie Required |
|---|---|
| `/admin/**` | `mernshop_admin` |
| `/cart` | `mern_cart` |
| `/checkout` | `mern_cart` |
| `/account` | `mern_cart` |

---

## Component API

### `<ProductCard product={} priority? />`
Renders image (blur placeholder), name, rating, price, badge, wishlist heart, and Add to Cart button.

| Prop | Type | Default | Description |
|---|---|---|---|
| `product` | `Product` | required | Product data object |
| `priority` | `boolean` | `false` | `true` for above-the-fold images (improves LCP) |

### `<SearchBar />`
URL-driven search + category filter + sort. No props — reads/writes `useSearchParams()`.

### `<WishlistButton product={} />`
Heart toggle button. Reads/writes Zustand `wishlistStore` (persisted to `localStorage`).

| Prop | Type | Description |
|---|---|---|
| `product` | `Product` | Product to toggle |
| `className?` | `string` | Additional Tailwind classes |

### `<AddToCartButton product={} size? />`
Calls `addToCart()` Server Action. Shows loading spinner and success feedback.

### `<LiveOrderFeed />`
Connects via `useSocket` hook. New orders prepend with Framer Motion slide-in animation.

### `<ProductsTable products={} />`
TanStack Table with column sorting (price, stock, rating), category filter, text search, and pagination (6 rows/page).

### `<CommandPalette open={} onClose={} />`
cmdk palette. Open with `Cmd+K` / `Ctrl+K`. Navigates to admin sections on Enter.

### `useSocket(onOrder, intervalMs?)`
Mock Socket.IO hook. Fires `onOrder(LiveOrder)` every `intervalMs` (default: random 3–6s).

```ts
// To swap to real Socket.IO in MERN-III:
import { io } from "socket.io-client";
const socket = io(process.env.NEXT_PUBLIC_API_URL!);
socket.on("new_order", onOrder);
return () => { socket.off("new_order", onOrder); socket.disconnect(); };
```

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `GET /api/products` | GET | All products. Query: `?category=Electronics&sort=price-asc&q=iphone` |
| `GET /api/products/[id]` | GET | Single product by ID |
| `GET /api/cart` | GET | Current session cart (reads HttpOnly cookie) |

All responses use the `ApiResponse<T>` wrapper:
```ts
// Success: { success: true, data: T, message?: string }
// Error:   { success: false, error: string, code?: string }
```

---

## Server Actions (app/actions/cart.ts)

All inputs validated with Zod before any business logic runs.

| Action | Input | Description |
|---|---|---|
| `addToCart(productId, qty?)` | string, number | Add item to session cart |
| `removeFromCart(productId)` | string | Remove item from session cart |
| `updateCartQty(productId, qty)` | string, number | Update quantity (0 = remove) |
| `clearCart()` | — | Empty the cart |
| `loginAction(email, password)` | string, string | Set session cookie (mock auth) |
| `logoutAction()` | — | Clear session cookie |

---

## Deploy to Vercel

### Option 1: Vercel CLI (recommended)

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option 2: GitHub integration

1. Push to GitHub: `git init && git add . && git commit -m "MERN-II Final Assembly"`
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. Framework preset: **Next.js** (auto-detected)
4. Add `NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app`
5. Click **Deploy**

Preview deployments are automatically created for every PR/push to non-main branches.

### Connecting to MERN-III backend

Once your Express + MongoDB backend is deployed on Render/Render:

```bash
# In Vercel dashboard → Settings → Environment Variables:
NEXT_PUBLIC_API_URL=https://your-backend.render.app
```

No code changes needed — `lib/products.ts` reads this variable automatically.

---

## Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production build locally
npm run lint         # ESLint
npm run type-check   # TypeScript check (tsc --noEmit)
npm run analyze      # Bundle analyzer (opens interactive treemap)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 + custom design tokens |
| Components | Shadcn/ui (Radix primitives) |
| Animations | Framer Motion 11 |
| State | Zustand 5 (cart + wishlist + auth) |
| Server state | TanStack Query 5 |
| Data table | TanStack Table 8 |
| Charts | Recharts 2 |
| Forms | React Hook Form 7 + Zod 3 |
| Command palette | cmdk 1 |
| Theme | next-themes |
| Env validation | t3-env |
| Linting | ESLint + Prettier + Husky |

---

## MERN-III Bridge Points

When your Express + MongoDB backend is ready, these are the only changes needed:

1. **Products API** — set `NEXT_PUBLIC_API_URL` → `fetchProducts()` calls your Express endpoint
2. **Cart** — replace cookie session in `lib/session.ts` with MongoDB cart collection
3. **Auth** — replace `loginAction()` mock with NextAuth.js `signIn()` + JWT
4. **Socket.IO** — replace `useSocket` mock interval with real `io(SOCKET_URL)` connection
5. **Orders** — replace `ADMIN_PRODUCTS` mock data with real MongoDB queries

---

*MERN-II Final Assembly · All modules wired · Ready for Vercel deploy*
