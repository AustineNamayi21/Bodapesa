import { all } from "@/lib/db";
import { Card, CATEGORY_TONE, Pill, formatKes } from "@/components/ui";
import type { ProductWithPartner } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER = ["SAVINGS", "CREDIT", "INSURANCE", "INVESTMENT", "PENSION"];

export default async function ProductsPage() {
  const products = await all<ProductWithPartner & { leads: number; converted: number }>(
    `SELECT p.*, pt.name AS partnerName, pt.code AS partnerCode, pt.accent AS partnerAccent,
            (SELECT COUNT(*) FROM Lead l WHERE l.productId = p.id) AS leads,
            (SELECT COUNT(*) FROM Lead l WHERE l.productId = p.id AND l.status = 'CONVERTED') AS converted
       FROM Product p JOIN Partner pt ON pt.id = p.partnerId
      WHERE p.active = 1
      ORDER BY pt.name, p.category, p.name`,
  );

  const partners = await all<{ code: string; name: string; kind: string; tagline: string | null; description: string | null; accent: string; website: string | null }>(
    "SELECT code, name, kind, tagline, description, accent, website FROM Partner ORDER BY name",
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[2rem] leading-tight">Partner product catalogue</h1>
        <p className="text-xs text-[var(--text-faint)] mt-0.5">
          What riders are being onboarded to. Every product carries a plain-language summary in three
          languages, which is what the messaging engine and USSD menu deliver.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {partners.map((p) => (
          <Card key={p.code}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ background: p.accent }} />
              <h2 className="font-semibold tracking-tight">{p.name}</h2>
              <Pill tone="neutral">{p.kind}</Pill>
            </div>
            {p.tagline ? <p className="text-[0.8rem] italic text-[var(--text-faint)] mb-2">{p.tagline}</p> : null}
            <p className="text-[0.82rem] leading-relaxed text-[var(--text-muted)]">{p.description}</p>
          </Card>
        ))}
      </div>

      <div
        className="text-[0.78rem] p-3 rounded-lg"
        style={{ background: "var(--accent-soft)", color: "var(--text-muted)" }}
      >
        <strong style={{ color: "var(--accent)" }}>Note on figures.</strong> Rates, premiums and limits below
        follow the partners&rsquo; published product structures and are indicative for the purposes of this
        project. They must be confirmed with Stima DT SACCO and Britam before the platform quotes them to
        riders in production.
      </div>

      {CATEGORY_ORDER.map((category) => {
        const items = products.filter((p) => p.category === category);
        if (!items.length) return null;
        return (
          <section key={category}>
            <h2 className="text-[0.95rem] font-semibold tracking-tight mb-3">
              {category.charAt(0) + category.slice(1).toLowerCase()}
              <span className="text-[0.75rem] font-normal text-[var(--text-faint)] ml-2">
                {items.length} product{items.length === 1 ? "" : "s"}
              </span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((p) => (
                <Card key={p.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-[0.9rem] font-semibold tracking-tight">{p.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.partnerAccent }} />
                        <span className="text-[0.72rem] text-[var(--text-faint)]">{p.partnerName}</span>
                      </div>
                    </div>
                    <Pill tone={CATEGORY_TONE[p.category]}>{p.category.toLowerCase()}</Pill>
                  </div>

                  <p className="text-[0.8rem] leading-relaxed text-[var(--text-muted)] flex-1">{p.summaryEn}</p>

                  <dl className="mt-3 space-y-1 text-[0.75rem]">
                    {p.minAmount ? (
                      <div className="flex justify-between gap-2">
                        <dt className="text-[var(--text-faint)]">From</dt>
                        <dd>{formatKes(p.minAmount)}</dd>
                      </div>
                    ) : null}
                    {p.maxAmount ? (
                      <div className="flex justify-between gap-2">
                        <dt className="text-[var(--text-faint)]">Up to</dt>
                        <dd>{formatKes(p.maxAmount)}</dd>
                      </div>
                    ) : null}
                    {p.interestRate ? (
                      <div className="flex justify-between gap-2">
                        <dt className="text-[var(--text-faint)]">Rate</dt>
                        <dd className="text-right">{p.interestRate}</dd>
                      </div>
                    ) : null}
                    {p.premium ? (
                      <div className="flex justify-between gap-2">
                        <dt className="text-[var(--text-faint)]">Premium</dt>
                        <dd className="text-right">{p.premium}</dd>
                      </div>
                    ) : null}
                    {p.termLabel ? (
                      <div className="flex justify-between gap-2">
                        <dt className="text-[var(--text-faint)]">Term</dt>
                        <dd className="text-right">{p.termLabel}</dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-[0.75rem]">
                    <span className="text-[var(--text-faint)]">
                      {p.leads} enquir{p.leads === 1 ? "y" : "ies"}
                    </span>
                    <span style={{ color: p.converted ? "var(--brand)" : "var(--text-faint)" }}>
                      {p.converted} converted
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
