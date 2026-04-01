import { z } from "zod";

/**
 * schemas/auth.ts — Zod schemas for auth forms and API.
 *
 * REUSE ACROSS THE STACK:
 *   - LoginForm (Client): zodResolver(LoginSchema) → RHF validation
 *   - POST /api/auth/login (Server): LoginSchema.safeParse(body) → API validation
 *   - Server Action (Server): LoginSchema.safeParse(input) → action validation
 *
 *   One schema, three contexts. No duplication.
 *
 * PASSWORD STRENGTH RULES (curriculum spec):
 *   - min 8 characters
 *   - at least one letter
 *   - at least one number
 */

// ── RegisterSchema ─────────────────────────────────────────────────────────────
export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters")
      .trim(),

    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof RegisterSchema>;

// ── LoginSchema ────────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

// ── UserSchema — shape returned from auth endpoints ───────────────────────────
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["customer", "admin"]),
  createdAt: z.string().datetime(),
  avatarUrl: z.string().url().optional(),
});

export type UserSchemaType = z.infer<typeof UserSchema>;

// ── Zod helpers ───────────────────────────────────────────────────────────────

/**
 * formatZodErrors — converts ZodError into a flat { field: message } map.
 * Use in API routes to return structured field-level errors.
 */
export function formatZodErrors(
  error: z.ZodError,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([key, msgs]) => [
      key,
      (msgs ?? [])[0] ?? "Invalid value",
    ]),
  );
}
