"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, Mail } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { useAuthStore } from "@/stores/authStore";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";
import { toast } from "@/stores/toastStore";

const LoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type LoginValues = z.infer<typeof LoginSchema>;

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const t = setTimeout(() => form.reset({ email: "", password: "" }), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    setUnverifiedEmail(null);
    const result = await loginAction(values.email, values.password);

    if (!result.success) {
      // Detect email-not-verified (403)
      if (result.statusCode === 403 || result.message?.toLowerCase().includes("verify your email")) {
        setUnverifiedEmail(values.email);
        return;
      }
      setError(result.message);
      toast.error("Sign in failed", result.message);
      return;
    }

    if (result.data) {
      setAuth(result.data.user as unknown as User, result.data.accessToken);
    }

    const userName = result.data?.user?.name ?? "there";
    // Set welcome flag for the banner
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mernshop_welcome", userName);
    }
    toast.success(`Welcome back, ${userName}!`, "You are now signed in.");

    const role = result.data?.user?.role;
    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  if (unverifiedEmail) {
    return (
      <div className="rounded-xl border border-amber/40 bg-amber-50 p-5 dark:border-amber/30 dark:bg-amber/10">
        <div className="mb-3 flex items-center gap-2">
          <Mail size={18} className="text-amber-600 dark:text-amber-400" />
          <p className="font-semibold text-amber-800 dark:text-amber-300">Email not verified</p>
        </div>
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-400">
          Please check your inbox and click the verification link before signing in.
        </p>
        <Link
          href={`/auth/verify-email-sent?email=${encodeURIComponent(unverifiedEmail)}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          Resend verification email →
        </Link>
        <button
          onClick={() => setUnverifiedEmail(null)}
          className="mt-3 block text-xs text-amber-600 hover:underline dark:text-amber-400"
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-4" noValidate>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Password</FormLabel>
              <Link href="/auth/forgot-password" className="text-xs text-amber hover:underline">
                Forgot password?
              </Link>
            </div>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="pr-11"
                  {...field}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted hover:text-ink dark:hover:text-white"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
            : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
