import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create Account — MERNShop" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-white/50 dark:hover:text-white">
          <ArrowLeft size={14} strokeWidth={2} />
          Back to store
        </Link>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-7 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink dark:bg-amber">
              <ShoppingBag size={22} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">
                Create account
              </h1>
              <p className="mt-1 text-sm text-ink-muted">Join MERNShop today</p>
            </div>
          </div>
          <RegisterForm />
        </div>


      </div>
    </div>
  );
}
