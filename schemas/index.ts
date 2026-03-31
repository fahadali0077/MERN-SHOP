/**
 * schemas/index.ts — barrel export for all Zod schemas.
 *
 * Import from "@/schemas" instead of individual schema files.
 * This makes refactoring easier — change the path in one place.
 */
export * from "./product";
export * from "./auth";
