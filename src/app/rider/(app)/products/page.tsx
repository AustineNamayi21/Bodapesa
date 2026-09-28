import { all } from "@/lib/db";
import { requireRider } from "@/lib/rider";
import { Card, CATEGORY_TONE, Pill, formatKes } from "@/components/ui";
import { pick, t } from "@/lib/i18n";
import { expressInterestAction } from "@/lib/actions";
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t("products", lang)}</h1>
        <p className="text-[0.78rem] text-[var(--text-muted)] mt-0.5">
          {lang === "EN"
            ? "From Stima DT SACCO and Britam. Tap “I'm interested” and an officer will call you."
            : lang === "SH"
              ? "Kutoka Stima DT SACCO na Britam. Bonyeza “Niko down” na officer atakucall."
              : "Kutoka Stima DT SACCO na Britam. Bonyeza “Ninavutiwa” na afisa atakupigia simu."}
        </p>
      </div>

      {CATEGORIES.map((category) => {
        const items = products.filter((p) => p.category === category);
        if (!items.length) return null;
        return (
          <section key={category}>
            <h2 className="text-[0.88rem] font-semibold tracking-tight mb-2">{CAT_LABEL[category]?.[lang]}</h2>
            <div className="space-y-2.5">
              {items.map((p) => {
                const requested = myLeads.has(p.id);
                return (
                  <Card key={p.id} className="scroll-mt-20">
                    <div id={p.id} />
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <h3 className="text-[0.9rem] font-semibold tracking-tight leading-snug">{p.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.accent }} />
                          <span className="text-[0.7rem] text-[var(--text-faint)]">{p.partnerName}</span>
                        </div>
                      </div>
                      <Pill tone={CATEGORY_TONE[p.category]}>{CAT_LABEL[p.category]?.[lang]}</Pill>
                    </div>

                    <p className="text-[0.82rem] leading-relaxed text-[var(--text-muted)]">
                      {pick(p, "summary", lang)}
                    </p>

                    {(p.minAmount || p.premium || p.interestRate || p.termLabel) && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {p.minAmount ? <Pill tone="neutral">{lang === "EN" ? "From" : "Kuanzia"} {formatKes(p.minAmount)}</Pill> : null}
                        {p.maxAmount ? <Pill tone="neutral">{lang === "EN" ? "Up to" : "Hadi"} {formatKes(p.maxAmount)}</Pill> : null}
                        {p.premium ? <Pill tone="neutral">{p.premium}</Pill> : null}
                        {p.interestRate ? <Pill tone="neutral">{p.interestRate}</Pill> : null}
                        {p.termLabel ? <Pill tone="neutral">{p.termLabel}</Pill> : null}
                      </div>
                    )}

                    <details className="mt-2.5">
                      <summary className="text-[0.76rem] cursor-pointer text-[var(--text-faint)]">
                        {lang === "EN" ? "Read more" : lang === "SH" ? "Soma zaidi" : "Soma zaidi"}
                      </summary>
                      <p className="text-[0.8rem] leading-relaxed text-[var(--text-muted)] mt-2">
                        {lang === "EN" ? p.detailsEn : p.detailsSw}
                      </p>
                      {p.eligibility ? (
                        <p className="text-[0.72rem] text-[var(--text-faint)] mt-2">
                          {lang === "EN" ? "Eligibility" : "Sifa"}: {p.eligibility}
                        </p>
                      ) : null}
                    </details>

                    <div className="mt-3">
                      {requested ? (
                        <div
                          className="text-[0.78rem] p-2.5 rounded-lg"
                          style={{ background: "var(--brand-soft)", color: "var(--brand-strong)" }}
                        >
                          ✓ {t("requestSent", lang)}
                        </div>
                      ) : (
                        <form action={expressInterestAction}>
                          <input type="hidden" name="riderId" value={rider.id} />
                          <input type="hidden" name="productId" value={p.id} />
                          <button className="btn btn-accent btn-sm w-full">{t("interested", lang)}</button>
                        </form>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="text-[0.7rem] text-[var(--text-faint)] leading-relaxed">
        {lang === "EN"
          ? "Rates, premiums and limits shown are indicative. The institution will confirm the exact terms when they contact you."
          : "Viwango, malipo na mipaka inayoonyeshwa ni ya makadirio. Taasisi itathibitisha masharti kamili itakapokupigia simu."}
      </p>
    </div>
  );
}
