import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";

export const metadata: Metadata = { title: "Cookie Policy" };

const COOKIE_TYPES = [
  {
    name: "Strictly Necessary",
    required: true,
    desc: "These cookies are essential for the website to function. They enable core features such as security, user authentication, shopping cart functionality, and page navigation. They cannot be disabled.",
    examples: ["Session token", "CSRF token", "Cart identifier"],
  },
  {
    name: "Performance & Analytics",
    required: false,
    desc: "These cookies help us understand how visitors interact with our website by collecting anonymous usage data. This helps us improve page performance and user experience.",
    examples: ["Pages visited", "Time on page", "Referral source"],
  },
  {
    name: "Functional",
    required: false,
    desc: "These cookies allow the website to remember choices you make (such as your preferred language, dark/light mode, or region) to provide a more personalised experience.",
    examples: ["Theme preference", "Language setting", "Region selection"],
  },
  {
    name: "Marketing",
    required: false,
    desc: "These cookies track your browsing activity to deliver relevant advertisements. They are set by advertising partners and help measure the effectiveness of ad campaigns.",
    examples: ["Ad tracking", "Retargeting", "Conversion tracking"],
  },
];

const SECTIONS = [
  {
    title: "What Are Cookies?",
    content: `Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to site owners. Cookies do not contain personal information on their own but can be linked to personal information stored elsewhere.`,
  },
  {
    title: "How Long Do Cookies Last?",
    content: `Session cookies expire when you close your browser. Persistent cookies remain on your device for a set period (typically 30 days to 2 years) or until you delete them. The specific duration depends on the purpose of each cookie.`,
  },
  {
    title: "Managing Your Cookie Preferences",
    content: `You can control cookies through your browser settings — most browsers allow you to block or delete cookies. Note that disabling certain cookies may impact site functionality such as maintaining your login session or cart contents. You can also opt out of analytics tracking via the preferences centre below.`,
  },
  {
    title: "Third-Party Cookies",
    content: `Some cookies on our site are set by third-party services we use, such as payment processors, analytics providers, and social media plugins. These third parties have their own privacy policies and we do not control the cookies they set.`,
  },
  {
    title: "Updates to This Policy",
    content: `We may update this Cookie Policy as we add new features or as regulations change. We will notify you of material changes by updating the "last updated" date above or by sending a notification.`,
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
        <ArrowLeft size={15} /> Back to Home
      </Link>

      <div className="mb-8">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Cookie size={26} className="text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-ink dark:text-white">Cookie Policy</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: January 1, 2025</p>
        <p className="mt-3 text-ink-muted">
          This policy explains what cookies MERNShop uses, why we use them, and how you can control them.
        </p>
      </div>

      {/* Cookie types */}
      <h2 className="mb-4 font-semibold text-ink dark:text-white">Types of Cookies We Use</h2>
      <div className="mb-10 space-y-4">
        {COOKIE_TYPES.map(({ name, required, desc, examples }) => (
          <div key={name} className="rounded-xl border border-border bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
            <div className="mb-2 flex items-center gap-3">
              <span className="font-semibold text-ink dark:text-white">{name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                required
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100 text-ink-muted dark:bg-dark-surface-2 dark:text-white/50"
              }`}>
                {required ? "Required" : "Optional"}
              </span>
            </div>
            <p className="text-sm text-ink-muted">{desc}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {examples.map((ex) => (
                <span key={ex} className="rounded-md bg-surface-raised px-2 py-0.5 text-xs text-ink-muted dark:bg-dark-surface-2">
                  {ex}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional sections */}
      <div className="space-y-5">
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
        {" · "}
        <Link href="/legal/privacy" className="font-semibold text-primary hover:underline">Privacy Policy →</Link>
      </div>
    </div>
  );
}
