import { all } from "@/lib/db";
import { requireRider } from "@/lib/rider";
import { BadgeCheck, HeartHandshake } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORY_TONE, Pill, formatKes } from "@/components/ui";
import { IconBadge } from "@/components/brand";
import { ModuleIcon } from "@/components/rider";
import { MODULE_THEME } from "@/lib/photos";
import { pick, t } from "@/lib/i18n";
import { expressInterestAction } from "@/lib/actions";
import { rankProducts, reasonIn } from "@/lib/match";
import { recordSignal } from "@/lib/signals";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Lang } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES = ["INSURANCE", "SAVINGS", "CREDIT", "INVESTMENT", "PENSION"];

const CAT_LABEL: Record<string, Record<Lang, string>> = {
  SAVINGS: { EN: "Savings", SW: "Akiba", SH: "Kubank doo" },
  CREDIT: { EN: "Credit", SW: "Mikopo", SH: "Loan" },
  INSURANCE: { EN: "Insurance", SW: "Bima", SH: "Bima" },
  INVESTMENT: { EN: "Investment", SW: "Uwekezaji", SH: "Invest" },
  PENSION: { EN: "Pension", SW: "Pensheni", SH: "Pension" },
};

export default async function RiderProductsPage() {
  const { rider, lang } = await requireRider();

  const products = await all<{
    id: string;
    name: string;
    category: string;
    summaryEn: string;
    summarySw: string;
    summarySh: string;
    detailsEn: string;
    detailsSw: string;
    minAmount: number | null;
    maxAmount: number | null;
    interestRate: string | null;
    premium: string | null;
    termLabel: string | null;
    eligibility: string | null;
    partnerName: string;
    accent: string;
  }>(
    `SELECT p.id, p.name, p.category, p.summaryEn, p.summarySw, p.summarySh, p.detailsEn, p.detailsSw,
            p.minAmount, p.maxAmount, p.interestRate, p.premium, p.termLabel, p.eligibility,
            pt.name AS partnerName, pt.accent
       FROM Product p JOIN Partner pt ON pt.id = p.partnerId
      WHERE p.active = 1 ORDER BY p.featured DESC, p.name`,
  );

  const leadRows = await all<{ productId: string }>(
    "SELECT productId FROM Lead WHERE riderId = ?",
    [rider.id],
  );
  const myLeads = new Set(leadRows.map((l) => l.productId));

  // Ranked against what this rider told us at registration. The top match is
  // surfaced with its reason; the categories below stay in their familiar
  // order, because riders navigate the page by category.
  const full = await all<Product>("SELECT * FROM Product WHERE active = 1");
  const ranked = rankProducts(rider, full);
  const best = ranked.find((m) => m.reason && !myLeads.has(m.product.id)) ?? null;
  const bestCard = best ? products.find((p) => p.id === best.product.id) ?? null : null;
  const bestReason = best ? reasonIn(best, lang) : null;
  if (bestCard) {
    await recordSignal({ riderId: rider.id, kind: "PRODUCT_VIEWED", productId: bestCard.id, dedupeHours: 12 });
  }

  return (
    <div className="space-y-7" style={{ padding: "1.5rem 1.25rem 0" }}>
      <div className="animate-rise">
        <h1 className="display-lg">{t("products", lang)}</h1>
        <p className="text-[0.84rem] text-[var(--text-muted)] mt-1">
          {lang === "EN"
            ? "From Stima DT SACCO and Britam. Tap “I'm interested” and an officer will call you."
            : lang === "SH"
              ? "Kutoka Stima DT SACCO na Britam. Bonyeza “Niko down” na officer atakucall."
              : "Kutoka Stima DT SACCO na Britam. Bonyeza “Ninavutiwa” na afisa atakupigia simu."}
        </p>
      </div>

      {bestCard && bestReason ? (
        <section
          className="animate-rise"
          style={{ borderTop: "2px solid var(--accent)", paddingTop: "1.1rem" }}
        >
          <p className="eyebrow" style={{ color: "var(--accent)" }}>
            {lang === "EN" ? "Suggested for you" : lang === "SH" ? "Imependekezwa kwako" : "Imependekezwa kwako"}
          </p>
          <h2 className="display-sm" style={{ marginTop: "0.5rem" }}>
            {bestCard.name}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem", lineHeight: 1.6 }}>
            {bestReason}
          </p>
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <a href={`#${bestCard.id}`} className="btn btn-accent btn-sm">
              {lang === "EN" ? "See it" : "Iangalie"}
            </a>
            <Link href={`/rider/inbox/new?product=${bestCard.id}`} className="btn btn-ghost btn-sm">
              <MessageCircle size={13} />{" "}
              {lang === "EN" ? "Ask about it" : lang === "SH" ? "Uliza kuihusu" : "Uliza kuihusu"}
            </Link>
          </div>
        </section>
      ) : null}

      <nav className="flex gap-2 overflow-x-auto scroll-thin -mx-4 px-4 pb-1 sticky top-[64px] z-20 py-2" style={{ background: "var(--bg)" }}>
        {CATEGORIES.filter((c) => products.some((p) => p.category === c)).map((c) => {
          const th = MODULE_THEME[c] ?? MODULE_THEME.SAVINGS;
          return (
            <a
              key={c}
              href={`#cat-${c}`}
              className="pill shrink-0 py-1.5 px-3 border-2 transition-transform hover:-translate-y-0.5"
              style={{ background: th.soft, color: th.text, borderColor: th.fill }}
            >
              <ModuleIcon moduleKey={c} size={13} /> {CAT_LABEL[c]?.[lang]}
            </a>
          );
        })}
      </nav>

      {CATEGORIES.map((category) => {
        const items = products.filter((p) => p.category === category);
        if (!items.length) return null;
        const th = MODULE_THEME[category] ?? MODULE_THEME.SAVINGS;
        return (
          <section key={category} id={`cat-${category}`} className="scroll-mt-32">
            <h2 className="text-xl mb-3 flex items-center gap-2">
              <IconBadge fill={th.fill} size={32}>
                <ModuleIcon moduleKey={category} size={16} />
              </IconBadge>
              {CAT_LABEL[category]?.[lang]}
            </h2>
            <div className="space-y-3">
              {items.map((p) => {
                const requested = myLeads.has(p.id);
                return (
                  <article key={p.id} className="card lift overflow-hidden scroll-mt-32 relative" id={p.id}>
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${p.accent}, ${th.fill})` }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h3 className="text-[1.1rem] leading-snug">{p.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="w-5 h-5 rounded-none grid place-items-center text-[0.6rem] font-extrabold text-white"
                              style={{ background: p.accent }}
                            >
                              {p.partnerName.charAt(0)}
                            </span>
                            <span className="text-[0.74rem] font-semibold text-[var(--text-faint)]">{p.partnerName}</span>
                          </div>
                        </div>
                        <Pill tone={CATEGORY_TONE[p.category]}>{CAT_LABEL[p.category]?.[lang]}</Pill>
                      </div>

                      <p className="text-[0.85rem] leading-relaxed text-[var(--text-muted)]">{pick(p, "summary", lang)}</p>

                      {(p.minAmount || p.premium || p.interestRate || p.termLabel) && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {p.minAmount ? <Chip>{lang === "EN" ? "From" : "Kuanzia"} {formatKes(p.minAmount)}</Chip> : null}
                          {p.maxAmount ? <Chip>{lang === "EN" ? "Up to" : "Hadi"} {formatKes(p.maxAmount)}</Chip> : null}
                          {p.premium ? <Chip>{p.premium}</Chip> : null}
                          {p.interestRate ? <Chip>{p.interestRate}</Chip> : null}
                          {p.termLabel ? <Chip>{p.termLabel}</Chip> : null}
                        </div>
                      )}

                      <details className="mt-3 group">
                        <summary className="text-[0.78rem] font-bold cursor-pointer list-none inline-flex items-center gap-1" style={{ color: th.text }}>
                          <span className="transition-transform group-open:rotate-90">›</span>
                          {lang === "EN" ? "Read more" : "Soma zaidi"}
                        </summary>
                        <p className="text-[0.82rem] leading-relaxed text-[var(--text-muted)] mt-2">
                          {lang === "EN" ? p.detailsEn : p.detailsSw}
                        </p>
                        {p.eligibility ? (
                          <p className="text-[0.74rem] text-[var(--text-faint)] mt-2">
                            {lang === "EN" ? "Eligibility" : "Sifa"}: {p.eligibility}
                          </p>
                        ) : null}
                      </details>

                      <div className="mt-4">
                        {requested ? (
                          <div
                            className="text-[0.8rem] p-3 rounded-none font-semibold flex items-center gap-2 animate-pop"
                            style={{ background: "var(--success-soft)", color: "var(--success)" }}
                          >
                            <BadgeCheck size={17} /> {t("requestSent", lang)}
                          </div>
                        ) : (
                          <form action={expressInterestAction}>
                            <input type="hidden" name="riderId" value={rider.id} />
                            <input type="hidden" name="productId" value={p.id} />
                            <button className="btn btn-accent w-full">
                              <HeartHandshake size={16} /> {t("interested", lang)}
                            </button>
                          </form>
                        )}
                        <Link
                          href={`/rider/inbox/new?product=${p.id}`}
                          className="btn btn-ghost btn-sm w-full"
                          style={{ marginTop: "0.5rem" }}
                        >
                          <MessageCircle size={14} />{" "}
                          {lang === "EN" ? "Ask a question" : lang === "SH" ? "Uliza swali" : "Uliza swali"}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="text-[0.72rem] text-[var(--text-faint)] leading-relaxed">
        {lang === "EN"
          ? "Rates, premiums and limits shown are indicative. The institution will confirm the exact terms when they contact you."
          : "Viwango, malipo na mipaka inayoonyeshwa ni ya makadirio. Taasisi itathibitisha masharti kamili itakapokupigia simu."}
      </p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="pill py-1 border" style={{ background: "var(--surface-2)", color: "var(--text)", borderColor: "var(--border-strong)" }}>
      {children}
    </span>
  );
}
