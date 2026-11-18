import { notFound, redirect } from "next/navigation";
import { all, count, one } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { deleteProductAction } from "@/lib/crud";
import { DangerButton, PageHeader } from "@/components/admin";
import { Pill } from "@/components/ui";
import ProductForm from "../ProductForm";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await currentUser();
  if (user?.role !== "PLATFORM_ADMIN") redirect("/admin/products");

  const product = await one<Product>("SELECT * FROM Product WHERE id = ?", [id]);
  if (!product) notFound();

  const partners = await all<{ id: string; name: string; code: string }>(
    "SELECT id, name, code FROM Partner ORDER BY name",
  );

  const leads = await count("SELECT COUNT(*) AS n FROM Lead WHERE productId = ?", [id]);
  const campaigns = await count("SELECT COUNT(*) AS n FROM Campaign WHERE productId = ?", [id]);
  const referenced = leads > 0 || campaigns > 0;

  return (
    <div>
      <PageHeader
        title={product.name}
        subtitle={`${product.code} · ${leads} enquir${leads === 1 ? "y" : "ies"}, ${campaigns} campaign${campaigns === 1 ? "" : "s"}`}
        back="/admin/products"
        backLabel="Product catalogue"
        actions={
          Number(product.active) === 1 ? <Pill tone="success">Live</Pill> : <Pill tone="neutral">Archived</Pill>
        }
      />

      <ProductForm product={product} partners={partners} />

      <div className="mt-10 pt-5 max-w-3xl" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="eyebrow">Remove</span>
        <p className="text-[0.82rem] my-3 max-w-prose" style={{ color: "var(--text-muted)" }}>
          {referenced
            ? "This product has history behind it, so removing it archives rather than deletes: it disappears from the rider portal and from new campaigns, and past leads and conversion figures stay accurate."
            : "No rider has enquired about this product and no campaign references it, so it can be deleted outright."}
        </p>
        <DangerButton
          action={deleteProductAction}
          hidden={{ productId: product.id }}
          label={referenced ? "Archive product" : "Delete product"}
          confirmLabel={referenced ? "Archive it" : "Delete permanently"}
          warning={
            referenced
              ? `${product.name} will be hidden from riders and from new campaigns. Its ${leads} existing lead${leads === 1 ? "" : "s"} stay in the pipeline.`
              : `${product.name} will be removed completely. This cannot be undone.`
          }
        />
      </div>
    </div>
  );
}
