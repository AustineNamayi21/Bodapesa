import { redirect } from "next/navigation";
import { all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const user = await currentUser();
  if (user?.role !== "PLATFORM_ADMIN") redirect("/admin/products");

  const partners = await all<{ id: string; name: string; code: string }>(
    "SELECT id, name, code FROM Partner ORDER BY name",
  );

  return (
    <div>
      <PageHeader
        title="New product"
        subtitle="Adding a product makes it available to riders in the portal immediately, and selectable as a campaign objective."
        back="/admin/products"
        backLabel="Product catalogue"
      />
      <ProductForm partners={partners} />
    </div>
  );
}
