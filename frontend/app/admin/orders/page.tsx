import { LiveOrderFeed } from "@/components/admin/LiveOrderFeed";

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <LiveOrderFeed />
    </div>
  );
}
