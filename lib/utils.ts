import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — Tailwind class merger utility.
 *
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 * Example: cn("px-4 py-2", isLarge && "px-8") → "px-8 py-2"
 * Without twMerge: "px-4 py-2 px-8" — both px classes present (wrong)
 * With twMerge:    "py-2 px-8"       — later class wins (correct)
 *
 * This is the standard Shadcn/ui utility — every component uses it.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
