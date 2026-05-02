"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, ArrowLeft, ShoppingBag, ShieldCheck } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/password";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/stores/toastStore";

const Schema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type Values = z.infer<typeof Schema>;

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<Values>({
        resolver: zodResolver(Schema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    // No token — invalid link
    if (!token) {
        return (
            <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center dark:border-dark-border dark:bg-dark-surface">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
                        <ShieldCheck size={28} className="text-red-500" />
                    </div>
                </div>
                <h2 className="font-serif text-xl text-ink dark:text-white">Invalid reset link</h2>
                <p className="mt-2 text-sm text-ink-muted">
                    This password reset link is invalid or missing. Please request a new one.
                </p>
                <Button asChild className="mt-6 w-full" variant="outline">
                    <Link href="/auth/forgot-password">Request new link</Link>
                </Button>
            </div>
        );
    }

    const onSubmit = async (values: Values) => {
        setServerError(null);
        const result = await resetPasswordAction(token, values.password);

        if (!result.success) {
            setServerError(result.message);
            return;
        }

        setSuccess(true);
        toast.success("Password reset!", "You can now sign in with your new password.");
        setTimeout(() => router.push("/auth/login"), 2500);
    };

    if (success) {
        return (
            <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center dark:border-dark-border dark:bg-dark-surface">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                        <ShieldCheck size={28} className="text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <h2 className="font-serif text-xl text-ink dark:text-white">Password reset!</h2>
                <p className="mt-2 text-sm text-ink-muted">
                    Your password has been updated. Redirecting you to sign in…
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:border-dark-border dark:bg-dark-surface">
            {/* Header */}
            <div className="mb-7 flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink dark:bg-amber">
                    <ShoppingBag size={22} className="text-white" strokeWidth={2} />
                </div>
                <div>
                    <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">
                        Set new password
                    </h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        Must be at least 8 characters with a number and uppercase letter
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form
                    onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }}
                    className="space-y-4"
                    noValidate
                >
                    {serverError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                            {serverError}
                        </div>
                    )}

                    {/* New password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New password</FormLabel>
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
                        )}
                    />

                    {/* Confirm password */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            className="pr-11"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted hover:text-ink dark:hover:text-white"
                                            tabIndex={-1}
                                            aria-label={showConfirm ? "Hide password" : "Show password"}
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
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <><Loader2 size={16} className="animate-spin" /> Resetting…</>
                        ) : (
                            "Reset password"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center py-8">
            <div className="w-full max-w-sm">
                <Link
                    href="/auth/login"
                    className="mb-8 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-white/50 dark:hover:text-white"
                >
                    <ArrowLeft size={14} strokeWidth={2} />
                    Back to sign in
                </Link>

                <Suspense fallback={<div className="h-64 rounded-2xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface animate-pulse" />}>
                    <ResetPasswordForm />
                </Suspense>

                <p className="mt-5 text-center text-sm text-ink-muted">
                    Remember your password?{" "}
                    <Link href="/auth/login" className="font-semibold text-amber hover:underline">
                        Sign in →
                    </Link>
                </p>
            </div>
        </div>
    );
}