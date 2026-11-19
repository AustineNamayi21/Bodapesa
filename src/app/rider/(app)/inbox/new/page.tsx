import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { all } from "@/lib/db";
import { requireRider } from "@/lib/rider";
import { riderSendMessageAction } from "@/lib/chat-actions";
import { Composer } from "@/components/chat";
import type { Product } from "@/lib/types";
import { rankProducts, reasonIn } from "@/lib/match";

export const dynamic = "force-dynamic";

const T = {
  back: { EN: "Messages", SW: "Ujumbe", SH: "Messages" },
  title: { EN: "Ask a question", SW: "Uliza swali", SH: "Uliza swali" },
  lede: {
    EN: "A real person answers — the BodaPesa team, or the partner behind the product you ask about.",
    SW: "Mtu halisi atajibu — timu ya BodaPesa, au mshirika aliye nyuma ya bidhaa unayouliza.",
    SH: "Mtu halisi atajibu — team ya BodaPesa, ama partner wa hiyo product unaulizia.",
  },
  about: { EN: "What is it about?", SW: "Ni kuhusu nini?", SH: "Ni kuhusu nini?" },
  general: { EN: "Something else", SW: "Kitu kingine", SH: "Kitu kingine" },
  generalHint: { EN: "Goes to the BodaPesa team", SW: "Inaenda kwa timu ya BodaPesa", SH: "Inaenda kwa team ya BodaPesa" },
  placeholder: {
    EN: "For example: how much do I need to start, and what happens if I miss a week?",
    SW: "Kwa mfano: ninahitaji kiasi gani kuanza, na nini kitatokea nikikosa wiki moja?",
    SH: "Kwa mfano: naitaji ngapi kuanza, na nikikosa wiki moja ni nini?",
  },
  send: { EN: "Send", SW: "Tuma", SH: "Tuma" },
} as const;

type Lang = "EN" | "SW" | "SH";
const t = (k: keyof typeof T, lang: string) => T[k][(lang as Lang) in T[k] ? (lang as Lang) : "EN"];

export default async function NewConversationPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: preselected } = await searchParams;
  const { rider, lang } = await requireRider();

  const products = await all<Product & { partnerName: string }>(
    `SELECT p.*, pt.name AS partnerName FROM Product p
       JOIN Partner pt ON pt.id = p.partnerId
      WHERE p.active = 1 ORDER BY p.name`,
  );
  // Ranked against this rider's own registration answers, so the list they
  // scroll starts with what actually fits them.
  const ranked = rankProducts(rider, products);
  const chosen = preselected && products.some((p) => p.id === preselected) ? preselected : "";

  return (
    <div style={{ padding: "1.25rem 1.25rem 0" }}>
      <Link
        href="/rider/inbox"
        className="cta"
        style={{ fontSize: "0.625rem", color: "var(--text-faint)", textDecoration: "none" }}
      >
        <ArrowLeft size={14} /> <span>{t("back", lang)}</span>
      </Link>

      <h1 className="display-lg" style={{ marginTop: "1rem" }}>
        {t("title", lang)}
      </h1>
      <p className="copy-sm" style={{ marginTop: "0.75rem", maxWidth: "40ch", color: "var(--text-muted)" }}>
        {t("lede", lang)}
      </p>

      {/* Picking a product routes the thread to that partner and opens the
          enquiry at the same time. */}
      <p className="stat-label" style={{ marginTop: "2rem" }}>
        {t("about", lang)}
      </p>
      <div style={{ marginTop: "0.9rem" }}>
        <ProductPicker
          ranked={ranked}
          chosen={chosen}
          lang={lang}
          generalLabel={t("general", lang)}
          generalHint={t("generalHint", lang)}
          placeholder={t("placeholder", lang)}
          sendLabel={t("send", lang)}
        />
      </div>
    </div>
  );
}

/**
 * Rendered on the server so the ranking and its reasons never reach the
 * client as data — the rider sees the sentence, not the scoring.
 */
function ProductPicker({
  ranked,
  chosen,
  lang,
  generalLabel,
  generalHint,
  placeholder,
  sendLabel,
}: {
  ranked: ReturnType<typeof rankProducts>;
  chosen: string;
  lang: string;
  generalLabel: string;
  generalHint: string;
  placeholder: string;
  sendLabel: string;
}) {
  const top = ranked.slice(0, 6);
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <OptionRow
          href="/rider/inbox/new"
          active={!chosen}
          title={generalLabel}
          hint={generalHint}
        />
        {top.map((m) => (
          <OptionRow
            key={m.product.id}
            href={`/rider/inbox/new?product=${m.product.id}`}
            active={chosen === m.product.id}
            title={m.product.name}
            hint={reasonIn(m, lang) ?? (m.product as Product & { partnerName: string }).partnerName}
          />
        ))}
      </div>

      <Composer
        action={riderSendMessageAction}
        productId={chosen || undefined}
        placeholder={placeholder}
        label={sendLabel}
        autoFocus
        redirectBase="/rider/inbox/"
      />
    </div>
  );
}

function OptionRow({
  href,
  active,
  title,
  hint,
}: {
  href: string;
  active: boolean;
  title: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.85rem 0",
        borderBottom: "1px solid var(--border)",
        textDecoration: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          width: "0.9rem",
          height: "0.9rem",
          flexShrink: 0,
          borderRadius: "999px",
          border: `1.5px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
          background: active ? "var(--accent)" : "transparent",
          boxShadow: active ? "inset 0 0 0 2px var(--ground)" : "none",
        }}
      />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "0.88rem", fontWeight: active ? 700 : 500 }}>{title}</span>
        <span style={{ display: "block", fontSize: "0.74rem", color: "var(--text-faint)", marginTop: "0.15rem" }}>
          {hint}
        </span>
      </span>
    </Link>
  );
}
