import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { toggleProductAction } from "@/lib/crud";
import { CATEGORY_TONE, Pill, formatKes } from "@/components/ui";
import { MiniForm, PageHeader } from "@/components/admin";
import type { ProductWithPartner } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER = ["SAVINGS", "CREDIT", "INSURANCE", "INVESTMENT", "PENSION"];

export default async function ProductsPage() {
  const user = await currentUser();
  const canEdit = user?.role === "PLATFORM_ADMIN";

  // Archived products are listed too — a catalogue that hides them makes it
  // impossible to bring one back without a database query.
  const products = await all<ProductWithPartner & { leads: number; converted: number }>(
    `SELECT p.*, pt.name AS partnerName, pt.code AS partnerCode, pt.accent AS partnerAccent,
            (SELECT COUNT(*) FROM Lead l WHERE l.productId = p.id) AS leads,
            (SELECT COUNT(*) FROM Lead l WHERE l.productId = p.id AND l.status = 'CONVERTED') AS converted
       FROM Product p JOIN Partner pt ON pt.id = p.partnerId
      ORDER BY pt.name, p.category, p.name`,
  );

  const partners = await all<{
    id: string;
    code: string;
    name: string;
    kind: string;
    tagline: string | null;
    description: string | null;
    accent: string;
  }>("SELECT id, code, name, kind, tagline, description, accent FROM Partner ORDER BY name");

  const live = products.filter((p) => Number(p.active) === 1).length;

  return (
    <div>
      <PageHeader
        title="Product catalogue"
        subtitle="What riders are onboarded to. Every product carries a plain-language summary in three languages, which is what the portal, the messaging engine and the USSD menu all deliver."
        actions={
          canEdit ? (
            <Link href="/admin/products/new" className="btn btn-primary btn-sm">
              <Plus size={14} /> New product
            </Link>
          ) : null
        }
      />

      {/* ── partners ──────────────────────────────────────────────────────── */}
      <section className="mb-9">
        <div className="rule-head mb-4">
          <h2 className="text-[1.1rem] leading-none">Partners</h2>
          <span className="eyebrow">{partners.length}</span>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {partners.map((p) => (
            <div key={p.code} className="py-4 pr-6" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span style={{ width: "10px", height: "10px", background: p.accent }} />
                <h3 className="text-[0.95rem]" style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                  {p.name}
                </h3>
                <Pill tone="neutral">{p.kind}</Pill>
              </div>
              {p.tagline ? (
                <p className="text-[0.8rem] mb-1.5" style={{ color: "var(--text-faint)", fontStyle: "italic" }}>
                  {p.tagline}
                </p>
              ) : null}
              <p className="text-[0.82rem] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {p.description}
              </p>
            </div>
          ))}
        </div>
        {canEdit ? (
          <Link href="/admin/partners" className="link-arrow mt-4 inline-flex">
            Manage partners
          </Link>
        ) : null}
      </section>

      <div
        className="text-[0.8rem] p-3.5 mb-9"
        style={{ background: "var(--surface-2)", borderLeft: "4px solid var(--ember)", color: "var(--text-muted)" }}
      >
        <strong style={{ color: "var(--text)" }}>Note on figures.</strong> Rates, premiums and limits follow the
        partners&rsquo; published product structures and are indicative for the purposes of this project. They must be
        confirmed with Stima DT SACCO and Britam before the platform quotes them to riders in production.
      </div>

      {/* ── catalogue ─────────────────────────────────────────────────────── */}
      {CATEGORY_ORDER.map((category) => {
        const items = products.filter((p) => p.category === category);
        if (!items.length) return null;
        return (
          <section key={category} className="mb-9">
            <div className="rule-head mb-4">
              <h2 className="text-[1.1rem] leading-none">{category.charAt(0) + category.slice(1).toLowerCase()}</h2>
              <span className="eyebrow">
                {items.length} product{items.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((p) => {
                const archived = Number(p.active) !== 1;
                return (
                  <article
                    key={p.id}
                    className="card p-4 flex flex-col lift"
                    style={archived ? { opacity: 0.6 } : undefined}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-[0.98rem] leading-snug" style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span style={{ width: "7px", height: "7px", background: p.partnerAccent }} />
                          <span className="text-[0.72rem]" style={{ color: "var(--text-faint)" }}>
                            {p.partnerName}
                          </span>
                        </div>
                      </div>
                      <Pill tone={CATEGORY_TONE[p.category]}>{p.category.toLowerCase()}</Pill>
                    </div>

                    <p className="text-[0.82rem] leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>
                      {p.summaryEn}
                    </p>

                    <dl className="mt-3 space-y-1 text-[0.76rem]">
                      {([
                        ["From", p.minAmount ? formatKes(p.minAmount) : null],
                        ["Up to", p.maxAmount ? formatKes(p.maxAmount) : null],
                        ["Rate", p.interestRate],
                        ["Premium", p.premium],
                        ["Term", p.termLabel],
                      ] as [string, string | null][])
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <dt style={{ color: "var(--text-faint)" }}>{k}</dt>
                            <dd className="text-right">{v}</dd>
                          </div>
                        ))}
                    </dl>

                    <div
                      className="mt-3 pt-3 flex items-center justify-between text-[0.75rem]"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <span style={{ color: "var(--text-faint)" }}>
                        {p.leads} enquir{p.leads === 1 ? "y" : "ies"} · {p.converted} converted
                      </span>
                      {archived ? <Pill tone="neutral">Archived</Pill> : null}
                    </div>

                    {canEdit ? (
                      <div className="mt-3 flex items-center gap-2">
                        <Link href={`/admin/products/${p.id}`} className="btn btn-ghost btn-sm">
                          <Pencil size={12} /> Edit
                        </Link>
                        <MiniForm action={toggleProductAction} hidden={{ productId: p.id }}>
                          <button type="submit" className="btn btn-ghost btn-sm">
                            {archived ? "Restore" : "Archive"}
                          </button>
                        </MiniForm>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="text-[0.78rem] pt-4" style={{ borderTop: "1px solid var(--border)", color: "var(--text-faint)" }}>
        {live} live {live === 1 ? "product" : "products"} across {partners.length} partners.
      </p>
    </div>
  );
}
