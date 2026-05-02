import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = { title: "Terms of Service" };

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using MERNShop you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services. We reserve the right to modify these terms at any time with notice.`,
  },
  {
    title: "2. Eligibility",
    content: `You must be at least 18 years old to create an account and make purchases. By using our services you represent that you meet this requirement and that all information you provide is accurate and complete.`,
  },
  {
    title: "3. Account Registration",
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorised use. We reserve the right to terminate accounts that violate these terms.`,
  },
  {
    title: "4. Products and Pricing",
    content: `We reserve the right to modify product listings, descriptions, and prices at any time. All prices are displayed in USD unless otherwise stated and are exclusive of applicable taxes. We are not responsible for typographical errors in pricing and reserve the right to cancel orders where pricing errors occur.`,
  },
  {
    title: "5. Orders and Payment",
    content: `By placing an order you make an offer to purchase the selected products. We reserve the right to refuse or cancel any order at our discretion. Payment must be received in full before orders are dispatched. We accept major credit cards, debit cards, and PayPal.`,
  },
  {
    title: "6. Shipping and Delivery",
    content: `We aim to dispatch orders within 1–2 business days. Delivery times are estimates only. Risk of loss passes to you upon delivery. Please refer to our Shipping Info page for full details.`,
  },
  {
    title: "7. Returns and Refunds",
    content: `Returns are accepted within 30 days of delivery in accordance with our Returns & Refunds policy. We reserve the right to reject returns that do not comply with our policy. Refunds will be processed to the original payment method.`,
  },
  {
    title: "8. Intellectual Property",
    content: `All content on MERNShop including text, images, logos, and software is the property of MERNShop or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `To the fullest extent permitted by law, MERNShop shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid by you for the specific order giving rise to the claim.`,
  },
  {
    title: "10. Governing Law",
    content: `These Terms of Service shall be governed by and construed in accordance with the laws of Pakistan. Any disputes arising shall be subject to the exclusive jurisdiction of the courts of Lahore, Pakistan.`,
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
        <ArrowLeft size={15} /> Back to Home
      </Link>

      <div className="mb-8">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <FileText size={26} className="text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-ink dark:text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: January 1, 2025</p>
        <p className="mt-3 text-ink-muted">
          Please read these terms carefully before using MERNShop. These terms govern your use of our website and services.
        </p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map(({ title, content }) => (
          <section key={title} className="rounded-xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
            <h2 className="mb-3 font-semibold text-ink dark:text-white">{title}</h2>
            <p className="text-sm leading-relaxed text-ink-muted">{content}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-ink-muted">
        Questions about these terms?{" "}
        <Link href="/support/contact" className="font-semibold text-primary hover:underline">Contact Us →</Link>
      </div>
    </div>
  );
}
