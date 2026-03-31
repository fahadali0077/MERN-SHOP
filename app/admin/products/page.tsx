import { ProductsTable } from "@/components/admin/ProductsTable";

export default function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <ProductsTable />
    </div>
  );
}
