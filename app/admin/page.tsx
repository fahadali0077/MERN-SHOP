import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatCards } from "@/components/admin/StatCards";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { LiveOrderFeed } from "@/components/admin/LiveOrderFeed";

/**
 * Admin Dashboard — /admin
 * Server Component shell; charts and live feed are Client Component islands.
 */
export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-0 p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-amber transition-colors">Home</Link>
        <ChevronRight size={13} className="text-gray-400" />
        <span className="text-gray-700 font-medium dark:text-white/80">Admin Dashboard</span>
      </nav>

      {/* Page header */}
      <div className="mb-6 border-b border-gray-200 pb-5 dark:border-dark-border">
        <h1 className="text-3xl font-bold text-ink dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your store</p>
      </div>

      {/* Stat cards */}
      <StatCards />

      {/* Charts + live feed */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <RevenueChart />
        <LiveOrderFeed />
      </div>
    </div>
  );
}
