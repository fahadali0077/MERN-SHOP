// ── Dashboard stats ────────────────────────────────────────────────────────────
export interface StatCard {
  id: string;
  label: string;
  value: string;
  delta: string;        // e.g. "+12.3%"
  trend: "up" | "down" | "neutral";
  icon: string;
}

export const DASHBOARD_STATS: StatCard[] = [
  { id: "revenue", label: "Total Revenue", value: "$48,295", delta: "+18.2%", trend: "up", icon: "💰" },
  { id: "orders", label: "Orders", value: "1,284", delta: "+9.4%", trend: "up", icon: "📦" },
  { id: "users", label: "Active Users", value: "3,741", delta: "+5.1%", trend: "up", icon: "👥" },
  { id: "stock", label: "Low Stock Items", value: "7", delta: "+3", trend: "down", icon: "⚠️" },
];

// ── Revenue chart data — 30 days ───────────────────────────────────────────────
export interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export const REVENUE_DATA: ChartDataPoint[] = [
  { date: "Mar 1", revenue: 1200, orders: 24 },
  { date: "Mar 3", revenue: 1850, orders: 37 },
  { date: "Mar 5", revenue: 980, orders: 19 },
  { date: "Mar 7", revenue: 2400, orders: 48 },
  { date: "Mar 9", revenue: 1600, orders: 32 },
  { date: "Mar 11", revenue: 2100, orders: 42 },
  { date: "Mar 13", revenue: 1750, orders: 35 },
  { date: "Mar 15", revenue: 3200, orders: 64 },
  { date: "Mar 17", revenue: 2800, orders: 56 },
  { date: "Mar 19", revenue: 1900, orders: 38 },
  { date: "Mar 21", revenue: 2600, orders: 52 },
  { date: "Mar 23", revenue: 3400, orders: 68 },
  { date: "Mar 25", revenue: 2900, orders: 58 },
  { date: "Mar 27", revenue: 4100, orders: 82 },
  { date: "Mar 28", revenue: 3800, orders: 76 },
];

// ── Admin product rows (includes stock field) ──────────────────────────────────
export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  badge?: string;
}

export const ADMIN_PRODUCTS: AdminProduct[] = [
  { id: "p-001", name: "Sony WH-1000XM5 Headphones", category: "Electronics", price: 279.99, stock: 42, rating: 4.8, badge: "Sale" },
  { id: "p-002", name: "Minimal Linen Shirt — Cream", category: "Fashion", price: 59.99, stock: 128, rating: 4.5, badge: "New" },
  { id: "p-003", name: "Cast Iron Skillet 10-inch", category: "Home & Kitchen", price: 44.95, stock: 63, rating: 4.9, badge: "Hot" },
  { id: "p-004", name: "Atomic Habits — James Clear", category: "Books", price: 14.99, stock: 310, rating: 4.7 },
  { id: "p-005", name: "Logitech MX Master 3S Mouse", category: "Electronics", price: 99.99, stock: 5, rating: 4.6, badge: "New" },
  { id: "p-006", name: "Yoga Mat — Non-Slip Pro", category: "Sports", price: 39.99, stock: 88, rating: 4.4 },
  { id: "p-007", name: "Kindle Paperwhite 11th Gen", category: "Electronics", price: 139.99, stock: 3, rating: 4.7, badge: "Sale" },
  { id: "p-008", name: "Chelsea Leather Boots — Black", category: "Fashion", price: 189.00, stock: 22, rating: 4.3 },
  { id: "p-009", name: "Aeropress Coffee Maker", category: "Home & Kitchen", price: 34.99, stock: 71, rating: 4.8, badge: "Hot" },
  { id: "p-010", name: "Clean Code — Robert C. Martin", category: "Books", price: 34.99, stock: 195, rating: 4.5 },
  { id: "p-011", name: "Resistance Bands Set (5-pack)", category: "Sports", price: 24.99, stock: 6, rating: 4.2, badge: "New" },
  { id: "p-012", name: "Samsung 27\" 4K Monitor", category: "Electronics", price: 329.99, stock: 2, rating: 4.6, badge: "Sale" },
];

// ── Live order event type ──────────────────────────────────────────────────────
export interface LiveOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  timestamp: string;
}

// Used by the mock Socket.IO event emitter
const CUSTOMER_NAMES = [
  "Fahad M.", "Abdul S.", "Sara K.", "Omar H.", "Aisha N.",
  "Bilal R.", "Zara T.", "Hassan A.", "Nadia F.", "Usman Q.",
];

const PRODUCT_NAMES = [
  "Sony Headphones", "Linen Shirt", "Cast Iron Skillet",
  "MX Master 3S", "Kindle Paperwhite", "Yoga Mat", "Samsung Monitor",
];

const STATUSES: LiveOrder["status"][] = ["pending", "processing", "shipped", "delivered"];

let orderCounter = 1000;

export function generateMockOrder(): LiveOrder {
  orderCounter++;
  return {
    id: `ORD-${orderCounter}`,
    customer: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)] ?? "Customer",
    product: PRODUCT_NAMES[Math.floor(Math.random() * PRODUCT_NAMES.length)] ?? "Product",
    amount: Math.round((Math.random() * 300 + 20) * 100) / 100,
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)] ?? "pending",
    timestamp: new Date().toISOString(),
  };
}

// ── Command palette items ──────────────────────────────────────────────────────
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: string;
  group: string;
}

export const COMMAND_ITEMS: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", description: "Overview & stats", href: "/admin", icon: "📊", group: "Navigation" },
  { id: "products", label: "Products", description: "Manage product catalogue", href: "/admin/products", icon: "📦", group: "Navigation" },
  { id: "orders", label: "Live Orders", description: "Real-time order feed", href: "/admin/orders", icon: "⚡", group: "Navigation" },
  { id: "users", label: "Users", description: "Customer management", href: "/admin/users", icon: "👥", group: "Navigation" },
  { id: "shop-home", label: "Shop Home", description: "View storefront", href: "/", icon: "🏠", group: "Shop" },
  { id: "shop-products", label: "All Products", description: "View product listing", href: "/products", icon: "🛍️", group: "Shop" },
  { id: "shop-cart", label: "Cart", description: "View shopping cart", href: "/cart", icon: "🛒", group: "Shop" },
  { id: "login", label: "Login Page", description: "Auth/login route", href: "/auth/login", icon: "🔐", group: "Auth" },
  { id: "register", label: "Register Page", description: "Auth/register route", href: "/auth/register", icon: "📝", group: "Auth" },
];
