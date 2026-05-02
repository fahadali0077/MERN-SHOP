import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = { title: "Privacy Policy" };

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `When you create an account or place an order we collect your name, email address, shipping address, and payment information. We also automatically collect browsing data such as IP address, browser type, pages visited, and referring URLs through standard server logs and cookies.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use collected information to process and fulfil orders, send order confirmations and shipping updates, respond to customer support enquiries, improve our website and product listings, send marketing emails (only with your consent), and comply with legal obligations.`,
  },
  {
    title: "3. Sharing of Information",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share data with trusted service providers who assist us in operating our website (e.g. payment processors, shipping carriers, analytics tools) subject to confidentiality agreements. We may disclose information when required by law.`,
  },
  {
    title: "4. Cookies",
    content: `We use cookies and similar tracking technologies to maintain your session, remember cart contents, and analyse site traffic. You can control cookie preferences through your browser settings or our Cookie Preferences centre. Disabling certain cookies may affect site functionality.`,
  },
  {
    title: "5. Data Security",
    content: `We implement industry-standard security measures including 256-bit SSL encryption for all transactions, secure password hashing, and regular security audits. However, no method of transmission over the internet is 100% secure and we cannot guarantee absolute security.`,
  },
  {
    title: "6. Data Retention",
    content: `We retain your personal data for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time by contacting us, subject to any retention requirements imposed by law.`,
  },
  {
    title: "7. Your Rights",
    content: `Depending on your jurisdiction you may have the right to access, correct, or delete your personal data; object to or restrict processing; request data portability; and withdraw consent at any time. To exercise these rights, please contact us at fahadj698@gmail.com.`,
  },
  {
    title: "8. Children's Privacy",
    content: `Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information we will delete it promptly.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or sending an email. Continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "10. Contact",
    content: `For any privacy-related questions or requests, please contact our Data Protection team at fahadj698@gmail.com or write to us at MERNShop, Lahore, Pakistan.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
        <ArrowLeft size={15} /> Back to Home
      </Link>

      <div className="mb-8">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Shield size={26} className="text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-ink dark:text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: January 1, 2025</p>
        <p className="mt-3 text-ink-muted">
          MERNShop ("we", "our", "us") is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.
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
        Questions?{" "}
        <Link href="/support/contact" className="font-semibold text-primary hover:underline">Contact Us →</Link>
      </div>
    </div>
  );
}
