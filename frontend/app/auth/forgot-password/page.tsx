"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, ShoppingBag, MailCheck } from "lucide-react";
import { forgotPasswordAction } from "@/app/actions/password";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Schema = z.object({
    email: z.string().email("Enter a valid email address"),
});
type Values = z.infer<typeof Schema>;

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<Values>({
        resolver: zodResolver(Schema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values: Values) => {
        setServerError(null);
        const result = await forgotPasswordAction(values.email);
        if (!result.success) {
            setServerError(result.message);
            return;
        }
        setSubmittedEmail(values.email);
        setSent(true);
    };

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

                <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:border-dark-border dark:bg-dark-surface">
                    {/* Header */}
                    <div className="mb-7 flex flex-col items-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink dark:bg-amber">
                            <ShoppingBag size={22} className="text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">
                                {sent ? "Check your inbox" : "Forgot password?"}
                            </h1>
                            <p className="mt-1 text-sm text-ink-muted">
                                {sent
                                    ? `We sent a reset link to ${submittedEmail}`
                                    : "Enter your email and we'll send you a reset link"}
                            </p>
                        </div>
                    </div>

                    {/* Sent state */}
                    {sent ? (
                        <div className="flex flex-col items-center gap-5 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                                <MailCheck size={32} className="text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-sm leading-relaxed text-ink-soft dark:text-ink-muted">
                                If an account exists for{" "}
                                <span className="font-semibold text-ink dark:text-white">{submittedEmail}</span>,
                                you will receive a password reset link within a few minutes.
                            </p>
                            <p className="text-xs text-ink-muted">
                                The link expires in <span className="font-semibold">10 minutes</span>.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => { setSent(false); form.reset(); }}
                            >
                                Try a different email
                            </Button>
                        </div>
                    ) : (
                        /* Form state */
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

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    autoComplete="email"
                                                    {...field}
                                                />
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
                                        <><Loader2 size={16} className="animate-spin" /> Sending…</>
                                    ) : (
                                        "Send reset link"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    )}
                </div>

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