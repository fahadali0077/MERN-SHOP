/**
 * seedRoute.ts — One-time seed route for Render deployment
 *
 * USAGE:
 * 1. Copy this file to backend/src/routes/seedRoute.ts
 * 2. Register it in app.ts (instructions below)
 * 3. Push to GitHub → Render redeploys
 * 4. Hit: GET https://mern-shop-c8hw.onrender.com/api/seed?secret=mernshop2024
 * 5. DELETE this file + remove from app.ts → push again
 *
 * REGISTER IN app.ts (add these 2 lines before the 404 handler):
 *   import seedRoute from "./routes/seedRoute.js";
 *   app.use("/api/seed", seedRoute);
 */

import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

const router = Router();

// ── Protect with a secret so random people can't hit it ──────────────────────
const SEED_SECRET = "mernshop2024";

// ── Admin credentials ─────────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@mernshop.com";
const ADMIN_PASSWORD = "Admin@1234";
const ADMIN_NAME = "MERNShop Admin";

// ── Product seed data ─────────────────────────────────────────────────────────
const PRODUCTS = [
    // ── Electronics ─────────────────────────────────────────────────────────────
    {
        name: "Sony WH-1000XM5 Wireless Headphones",
        price: 279.99,
        originalPrice: 349.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500",
        ],
        rating: 4.8,
        reviewCount: 2341,
        category: "Electronics",
        badge: "Sale",
        description: "Industry-leading noise canceling headphones with 30-hour battery life, crystal clear hands-free calling, and Multipoint Bluetooth connection.",
        stock: 45,
    },
    {
        name: "Apple MacBook Air M2",
        price: 1099.99,
        originalPrice: 1199.99,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
        images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
            "https://images.unsplash.com/photo-1611186871525-9ba4dc9a57e0?w=500",
        ],
        rating: 4.9,
        reviewCount: 5678,
        category: "Electronics",
        badge: "Hot",
        description: "Supercharged by the next-generation M2 chip, MacBook Air is impossibly thin and can handle even the most demanding tasks.",
        stock: 20,
    },
    {
        name: "Samsung 4K OLED Smart TV 55\"",
        price: 899.99,
        originalPrice: 1099.99,
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=500",
        images: [
            "https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=500",
        ],
        rating: 4.7,
        reviewCount: 1892,
        category: "Electronics",
        badge: "Sale",
        description: "Experience breathtaking 4K OLED picture quality with Quantum HDR and Object Tracking Sound technology.",
        stock: 15,
    },
    {
        name: "iPhone 15 Pro Max",
        price: 1199.99,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
        images: [
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
        ],
        rating: 4.9,
        reviewCount: 8901,
        category: "Electronics",
        badge: "New",
        description: "A17 Pro chip, titanium design, and the most powerful iPhone camera system ever. Pro camera system with 5x optical zoom.",
        stock: 30,
    },
    {
        name: "Sony PlayStation 5",
        price: 499.99,
        image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500",
        images: [
            "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500",
        ],
        rating: 4.8,
        reviewCount: 12345,
        category: "Electronics",
        badge: "Hot",
        description: "Experience lightning-fast loading with ultra-high speed SSD, deeper immersion with haptic feedback and 3D Audio.",
        stock: 10,
    },
    {
        name: "Logitech MX Master 3S Mouse",
        price: 99.99,
        originalPrice: 119.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        images: [
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        ],
        rating: 4.7,
        reviewCount: 3456,
        category: "Electronics",
        badge: "Sale",
        description: "Advanced wireless mouse with ultra-fast MagSpeed scrolling, 8K DPI sensor, and ergonomic design for all-day comfort.",
        stock: 60,
    },

    // ── Fashion ───────────────────────────────────────────────────────────────────
    {
        name: "Nike Air Max 270 Sneakers",
        price: 129.99,
        originalPrice: 150.00,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=500",
        ],
        rating: 4.6,
        reviewCount: 4521,
        category: "Fashion",
        badge: "Sale",
        description: "Inspired by Air Max icons of the past, the Nike Air Max 270 delivers a fresh, modern look with a large Air unit underfoot.",
        stock: 80,
    },
    {
        name: "Levi's 501 Original Jeans",
        price: 69.99,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
        images: [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
        ],
        rating: 4.5,
        reviewCount: 7832,
        category: "Fashion",
        description: "The original blue jean since 1873. Straight fit with a regular waist and straight leg from hip to ankle.",
        stock: 120,
    },
    {
        name: "Classic Wool Overcoat",
        price: 189.99,
        originalPrice: 249.99,
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500",
        images: [
            "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500",
        ],
        rating: 4.7,
        reviewCount: 892,
        category: "Fashion",
        badge: "Sale",
        description: "Timeless double-breasted wool overcoat. Crafted from premium wool blend for warmth and style.",
        stock: 35,
    },
    {
        name: "Ray-Ban Aviator Sunglasses",
        price: 154.99,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
        images: [
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
        ],
        rating: 4.8,
        reviewCount: 3210,
        category: "Fashion",
        badge: "Hot",
        description: "The iconic aviator style with crystal lenses and a metal frame. UV400 protection and polarized lenses available.",
        stock: 55,
    },

    // ── Home & Kitchen ────────────────────────────────────────────────────────────
    {
        name: "Instant Pot Duo 7-in-1",
        price: 79.99,
        originalPrice: 99.99,
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
        images: [
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
        ],
        rating: 4.7,
        reviewCount: 15678,
        category: "Home & Kitchen",
        badge: "Sale",
        description: "7-in-1 multi-use programmable pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker and warmer.",
        stock: 90,
    },
    {
        name: "Dyson V15 Detect Vacuum",
        price: 649.99,
        originalPrice: 749.99,
        image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500",
        images: [
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500",
        ],
        rating: 4.8,
        reviewCount: 2341,
        category: "Home & Kitchen",
        badge: "Sale",
        description: "Laser detects invisible dust. Automatically adapts suction power to scientifically prove what you've vacuumed.",
        stock: 25,
    },
    {
        name: "KitchenAid Stand Mixer",
        price: 379.99,
        originalPrice: 449.99,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
        images: [
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
        ],
        rating: 4.9,
        reviewCount: 9876,
        category: "Home & Kitchen",
        badge: "Hot",
        description: "5-quart bowl-lift stand mixer with 10 speeds. Includes flat beater, dough hook, and wire whip.",
        stock: 18,
    },
    {
        name: "Nespresso Vertuo Coffee Machine",
        price: 159.99,
        originalPrice: 199.99,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
        images: [
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
        ],
        rating: 4.6,
        reviewCount: 5432,
        category: "Home & Kitchen",
        badge: "Sale",
        description: "Brew single-serve coffee and espresso drinks at the touch of a button. Centrifusion technology for perfect crema every time.",
        stock: 40,
    },

    // ── Books ─────────────────────────────────────────────────────────────────────
    {
        name: "Atomic Habits by James Clear",
        price: 16.99,
        originalPrice: 27.00,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
        images: [
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
        ],
        rating: 4.9,
        reviewCount: 45678,
        category: "Books",
        badge: "Hot",
        description: "The #1 New York Times bestseller about tiny changes that lead to remarkable results. A proven framework for building good habits.",
        stock: 200,
    },
    {
        name: "Clean Code by Robert C. Martin",
        price: 34.99,
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
        images: [
            "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
        ],
        rating: 4.7,
        reviewCount: 12345,
        category: "Books",
        description: "A handbook of agile software craftsmanship. Essential reading for every professional software developer.",
        stock: 150,
    },
    {
        name: "The Psychology of Money",
        price: 14.99,
        originalPrice: 22.00,
        image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500",
        images: [
            "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500",
        ],
        rating: 4.8,
        reviewCount: 23456,
        category: "Books",
        badge: "Sale",
        description: "Timeless lessons on wealth, greed, and happiness. Morgan Housel shares 19 short stories exploring the ways people think about money.",
        stock: 180,
    },
    {
        name: "Deep Work by Cal Newport",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
        images: [
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
        ],
        rating: 4.6,
        reviewCount: 8901,
        category: "Books",
        badge: "New",
        description: "Rules for focused success in a distracted world. A must-read for anyone seeking a competitive advantage in the modern economy.",
        stock: 160,
    },

    // ── Sports ────────────────────────────────────────────────────────────────────
    {
        name: "Peloton Bike+ Indoor Cycle",
        price: 2195.00,
        originalPrice: 2495.00,
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
        images: [
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
        ],
        rating: 4.7,
        reviewCount: 3456,
        category: "Sports",
        badge: "Sale",
        description: "The ultimate home fitness experience. Auto-Follow resistance, rotating HD touchscreen, and access to thousands of live and on-demand classes.",
        stock: 8,
    },
    {
        name: "Wilson Pro Staff Tennis Racket",
        price: 189.99,
        originalPrice: 229.99,
        image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500",
        images: [
            "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500",
        ],
        rating: 4.8,
        reviewCount: 1234,
        category: "Sports",
        badge: "Sale",
        description: "Used by Roger Federer for most of his Grand Slam titles. Braided graphite construction for excellent control and feel.",
        stock: 30,
    },
    {
        name: "Adidas Ultraboost 23 Running Shoes",
        price: 149.99,
        originalPrice: 189.99,
        image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
        images: [
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
        ],
        rating: 4.7,
        reviewCount: 5678,
        category: "Sports",
        badge: "New",
        description: "Feel the energy return with every stride. BOOST midsole and Continental rubber outsole for incredible cushioning and grip.",
        stock: 70,
    },
    {
        name: "Yoga Mat Premium Non-Slip",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
        images: [
            "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
        ],
        rating: 4.6,
        reviewCount: 7890,
        category: "Sports",
        description: "Extra thick 6mm yoga mat with alignment lines. Non-slip surface, eco-friendly TPE material, includes carrying strap.",
        stock: 100,
    },
];

// ── Seed Route ────────────────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
    // Secret check
    if (req.query["secret"] !== SEED_SECRET) {
        res.status(401).json({ success: false, error: "Unauthorized — wrong secret" });
        return;
    }

    try {
        const results: Record<string, unknown> = {};

        // ── Seed Products ──────────────────────────────────────────────────────────
        await Product.deleteMany({});
        const inserted = await Product.insertMany(PRODUCTS);
        results["products"] = `✅ Seeded ${inserted.length} products`;

        // ── Seed Admin ─────────────────────────────────────────────────────────────
        const existing = await User.findOne({ email: ADMIN_EMAIL });

        if (existing) {
            if (existing.role !== "admin") {
                existing.role = "admin";
                await existing.save({ validateBeforeSave: false });
                results["admin"] = `✅ Upgraded ${ADMIN_EMAIL} to admin`;
            } else {
                results["admin"] = `✅ Admin already exists: ${ADMIN_EMAIL}`;
            }
        } else {
            await User.create({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: "admin",
            });
            results["admin"] = `✅ Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`;
        }

        // ── Stats ──────────────────────────────────────────────────────────────────
        const stats = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]) as { _id: string; count: number }[];

        results["breakdown"] = stats.reduce<Record<string, number>>((acc, s) => {
            acc[s._id] = s.count;
            return acc;
        }, {});

        results["dbState"] = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

        res.json({
            success: true,
            message: "🌱 Database seeded successfully! DELETE this route now.",
            results,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : String(err),
        });
    }
});

export default router;