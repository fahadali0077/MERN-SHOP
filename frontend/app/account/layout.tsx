/**
 * Account section layout.
 * Wraps all /account/** pages with a consistent light-gray background so
 * white cards visually pop in light mode, and ensures uniform vertical padding.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-sunken py-2 dark:bg-dark-bg">
      {children}
    </div>
  );
}
