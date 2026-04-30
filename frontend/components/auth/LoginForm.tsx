"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { useAuthStore } from "@/stores/authStore";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";
import { toast } from "@/stores/toastStore";

const LoginSchema = z.object({
  email:    z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type LoginValues = z.infer<typeof LoginSchema>;

export function LoginForm() {
  const [error, setError]               = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router  = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Clear fields on mount to defeat browser autofill
  useState(() => {
    setTimeout(() => form.reset({ email: "", password: "" }), 50);
  });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    const result = await loginAction(values.email, values.password);

    if (!result.success) {
      setError(result.message);
      toast.error("Sign in failed", result.message);
      return;
    }

    if (result.data) {
      setAuth(result.data.user as unknown as User, result.data.accessToken);
    }

    const userName = result.data?.user?.name ?? "there";
    toast.success(`Welcome back, ${userName}!`, "You are now signed in.");

    // Redirect admins to the dashboard, regular users to their account
    const role = result.data?.user?.role;
    const searchParams = new URLSearchParams(window.location.search);
    const from = searchParams.get("from");

    if (role === "admin" || role === "moderator") {
      router.push("/admin");
    } else if (from && from.startsWith("/") && !from.startsWith("//")) {
      router.push(from);
    } else {
      router.push("/account");
    }
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-4" noValidate autoComplete="off">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="you@example.com" autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
