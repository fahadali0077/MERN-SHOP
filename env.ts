import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * env.ts — type-safe environment variables via t3-env.
 *
 * MENTAL MODEL — why t3-env?
 *
 *   Without t3-env:
 *     process.env.DATABASE_URL  → string | undefined
 *     process.env.MISSING_VAR   → undefined (silent failure!)
 *     You only discover missing env vars at RUNTIME when the code crashes.
 *
 *   With t3-env:
 *     env.DATABASE_URL  → string (always defined — validated at startup)
 *     env.MISSING_VAR   → TypeScript ERROR at compile time
 *     Missing or invalid vars cause a STARTUP crash with a clear message.
 *
 * VALIDATION HAPPENS AT STARTUP:
 *   t3-env calls createEnv() at module evaluation time.
 *   If any required variable is missing or invalid, the app crashes
 *   immediately with a descriptive error — not later when the code runs.
 *
 * server vs client:
 *   server: only accessible on the server (never sent to the browser)
 *   client: accessible on the client (must start with NEXT_PUBLIC_)
 *
 * runtimeEnv: maps the Zod schema keys to actual process.env values.
 *   Required so t3-env can validate them without relying on string literals.
 *
 * USAGE:
 *   import { env } from "@/env"
 *   env.DATABASE_URL          // always a string
 *   env.NEXT_PUBLIC_BASE_URL  // always a string
 *
 * IN THIS MODULE:
 *   Most variables have defaults for local development.
 *   In production (Vercel), set them in the dashboard.
 *   Module 9 (MERN-III) adds MONGODB_URI and NEXTAUTH_SECRET as required.
 */
export const env = createEnv({
  /**
   * Server-side environment variables.
   * NEVER accessible in client-side code.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // MongoDB connection (required in MERN-III, optional now)
    DATABASE_URL: z
      .string()
      .url("DATABASE_URL must be a valid MongoDB connection string")
      .optional(),

    // NextAuth (required in MERN-IV, optional now)
    NEXTAUTH_SECRET: z
      .string()
      .min(32, "NEXTAUTH_SECRET must be at least 32 characters")
      .optional(),

    NEXTAUTH_URL: z.string().url().optional(),
  },

  /**
   * Client-side environment variables.
   * MUST start with NEXT_PUBLIC_ to be exposed to the browser.
   */
  client: {
    NEXT_PUBLIC_BASE_URL: z
      .string()
      .url("NEXT_PUBLIC_BASE_URL must be a valid URL")
      .default("http://localhost:3000"),

    NEXT_PUBLIC_APP_NAME: z
      .string()
      .default("MERNShop"),
  },

  /**
   * runtimeEnv — maps schema keys to actual process.env values.
   * t3-env validates THESE values, not process.env directly.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },

  /**
   * skipValidation: disable validation in CI or when building Docker images
   * where env vars aren't available yet.
   * Set SKIP_ENV_VALIDATION=true to skip.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * emptyStringAsUndefined: treat "" the same as undefined.
   * Prevents bugs from empty-string env vars.
   */
  emptyStringAsUndefined: true,
});
