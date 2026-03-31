"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Camera, X, User } from "lucide-react";
import { RegisterSchema, type RegisterFormValues } from "@/schemas/auth";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function getPasswordStrength(pwd: string): { level: number; label: string; color: string } {
  let level = 0;
  if (pwd.length >= 8) level++;
  if (/[A-Z]/.test(pwd)) level++;
  if (/[0-9]/.test(pwd)) level++;
  if (/[^a-zA-Z0-9]/.test(pwd)) level++;
  const map = [
    { label: "", color: "bg-border" },
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-amber" },
    { label: "Good", color: "bg-amber-light" },
    { label: "Strong", color: "bg-green-500" },
  ];
  return { level, ...(map[level] ?? map[0]) };
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordValue = form.watch("password");
  const strength = getPasswordStrength(passwordValue);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => { setAvatar(ev.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: RegisterFormValues) => {
    await new Promise((res) => setTimeout(res, 900));
    console.log("Register:", { ...data, avatar });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        {avatar ? (
          <img
            src={avatar}
            alt="Profile"
            className="h-16 w-16 rounded-full object-cover ring-2 ring-green-400"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600 dark:bg-green-900/30">
            ✓
          </div>
        )}
        <h3 className="font-serif text-xl">Account created!</h3>
        <p className="text-sm text-ink-muted">You can now sign in with your credentials.</p>
        <Button variant="outline" asChild>
          <Link href="/auth/login">Go to Login →</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }}
        className="flex flex-col gap-5"
        noValidate
      >
        {/* ── Profile Picture ─────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2">
          <p className="self-start text-sm font-medium text-ink dark:text-white">
            Profile Picture <span className="text-xs font-normal text-ink-muted">(optional)</span>
          </p>

          <div className="relative">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-cream transition hover:border-amber dark:border-dark-border dark:bg-dark-surface-2"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-ink-muted group-hover:text-amber">
                  <User size={24} strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/30 opacity-0 transition group-hover:opacity-100">
                <Camera size={18} className="text-white" />
              </div>
            </div>

            {avatar && (
              <button
                type="button"
                onClick={removeAvatar}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
                aria-label="Remove photo"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-medium text-amber hover:underline"
          >
            {avatar ? "Change photo" : "Upload photo"}
          </button>

          {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* ── Name ────────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Fahad Ali" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Email ───────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Password ────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars with a number"
                    autoComplete="new-password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink dark:hover:text-white"
                    onClick={() => { setShowPassword((v) => !v); }}
                    aria-label={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>

              {passwordValue.length > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength.level ? strength.color : "bg-border"
                          }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <span className="text-xs font-medium text-ink-muted">{strength.label}</span>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Confirm Password ────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink dark:hover:text-white"
                    onClick={() => { setShowConfirm((v) => !v); }}
                    aria-label={showConfirm ? "Hide" : "Show"}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <><Loader2 size={16} className="animate-spin" /> Creating account…</>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-amber hover:underline">
            Log in →
          </Link>
        </p>
      </form>
    </Form>
  );
}