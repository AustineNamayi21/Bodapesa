import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { ensureSeeded } from "@/lib/seed";
import { kpis } from "@/lib/analytics";
import { all, count } from "@/lib/db";
import { PHOTOS } from "@/lib/photos";
import { Logo, Photo } from "@/components/brand";
import { CountUp } from "@/components/motion";
import { SiteHeader } from "@/components/site";

export const dynamic = "force-dynamic";

/**
 * The public site.
 *
 * Built as a sequence of full-width frames rather than a column of cards.
 * Each frame is one idea, carried by a photograph at full bleed and a single
 * display headline; the supporting copy is deliberately small and quiet. The
 * structure follows the reference design language: a viewport-filling
 * opening image, an asymmetric editorial split, hairline-divided panels, a
 * band of large figures, and a closing frame.
 */

const MODULES = [
  {
    n: "01",
    title: "Savings",
    body: "Pay yourself first. Build three months of cover. Keep the bike's money apart from your own.",
  },
  {
    n: "02",
    title: "Credit",
    body: "What a loan really costs once the fees are in. Which debt builds, and which quietly eats.",
  },
  {
    n: "03",
    title: "Investment",
    body: "Why cash standing still goes backwards. Where an honest return comes from. How to spot a scheme.",
  },
  {
    n: "04",
    title: "Insurance",
    body: "How pooling works. Which cover to buy first. How to make a claim that actually gets paid.",
  },
];

export default async function Home() {
  await ensureSeeded();
  const k = await kpis();
  const stages = await count("SELECT COUNT(*) AS n FROM Stage");
  const products = await count("SELECT COUNT(*) AS n FROM Product WHERE active = 1");
  const lessons = await count("SELECT COUNT(*) AS n FROM Lesson WHERE active = 1");
  const partners = await all<{ name: string; code: string; kind: string; tagline: string | null; n: number }>(
    `SELECT pt.name, pt.code, pt.kind, pt.tagline, COUNT(p.id) AS n FROM Partner pt
       LEFT JOIN Product p ON p.partnerId = pt.id AND p.active = 1
      GROUP BY pt.id, pt.name, pt.code, pt.kind, pt.tagline ORDER BY pt.name`,
  );
  const credits = Object.values(PHOTOS).filter((p, i, arr) => arr.findIndex((q) => q.credit === p.credit) === i);

  return (
    <main style={{ background: "var(--ground)", overflowX: "clip" }}>
      <SiteHeader />

      {/* ═══════════════════════════════════════════════ opening frame ══ */}
      <section className="frame-hero">
        <div className="frame-media animate-kenburns">
          <Photo name="heroRider" priority sizes="100vw" />
        </div>
        <div className="scrim" />

        <div
          style={{
            width: "100%",
            paddingInline: "var(--gutter)",
            paddingBottom: "clamp(48px, 8vh, 88px)",
            paddingTop: "140px",
          }}
        >
          <p className="eyebrow eyebrow-rule animate-rise" style={{ color: "#fff" }}>
            Kwa wanabodaboda wa Nairobi
          </p>
          <h1 className="display-xl animate-rise d-1" style={{ marginTop: "1.5rem", maxWidth: "15ch", color: "#fff" }}>
            Every shilling you ride for, working for you
          </h1>
          <p className="copy animate-rise d-2" style={{ marginTop: "1.75rem", color: "rgba(255,255,255,0.78)" }}>
            Free money lessons in Kiswahili, English and Sheng. Then a direct line to real savings, credit and
            insurance from Stima DT SACCO and Britam.
          </p>

          <div
            className="animate-rise d-3"
            style={{ marginTop: "2.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2.25rem" }}
          >
            <Link href="/rider/register" className="cta" style={{ color: "#fff" }}>
              <span>Register — it&rsquo;s free</span>
              <span className="cta-ring">
                <ArrowRight size={15} />
              </span>
            </Link>
            <Link href="/rider" className="underline-wipe" style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Already registered
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ numbers ══ */}
      <section className="frame" style={{ background: "var(--ground)", borderTop: "1px solid var(--rule)" }}>
        <p className="eyebrow eyebrow-rule reveal">Where the programme stands</p>
        <div
          className="reveal"
          style={{
            marginTop: "clamp(32px, 5vw, 56px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "1px",
            background: "var(--rule)",
          }}
        >
          {[
            { v: k.riders, label: "Riders registered" },
            { v: k.messagesSent, label: "Lessons delivered" },
            { v: stages, label: "Stages reached" },
            { v: products, label: "Partner products", accent: true },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--ground)", padding: "1.5rem 1.75rem 1.5rem 0" }}>
              <p className="figure" style={{ color: s.accent ? "var(--accent)" : "var(--text)" }}>
                <CountUp value={Number(s.v)} />
              </p>
              <p className="stat-label" style={{ marginTop: "1rem" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ editorial split ══ */}
      <section id="how" className="split on-paper scroll-mt-20">
        <div className="split-copy">
          <p className="eyebrow eyebrow-rule reveal">The problem</p>
          <h2 className="display-lg reveal" style={{ marginTop: "1.5rem", maxWidth: "11ch" }}>
            A gearbox goes on a Tuesday
          </h2>
          <p className="copy reveal" style={{ marginTop: "1.75rem" }}>
            No savings, no cover, no credit record. The only options left are a lender charging 20% a month or
            selling the bike below value. Twelve lessons change the order those decisions get made in — and who is
            standing behind the rider when they do.
          </p>
          <div className="reveal" style={{ marginTop: "2.5rem" }}>
            <Link href="/rider/learn" className="cta">
              <span>See the curriculum</span>
              <span className="cta-ring">
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>
        <div className="split-media parallax-media photo-zoom">
          <Photo name="vendor" sizes="(max-width: 900px) 100vw, 42vw" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════ module panels ══ */}
      <section id="learn" className="scroll-mt-20" style={{ background: "var(--ground)" }}>
        <div className="frame-tight" style={{ borderBottom: "1px solid var(--rule)" }}>
          <p className="eyebrow eyebrow-rule reveal">The curriculum · {lessons} lessons</p>
          <h2 className="display-md reveal" style={{ marginTop: "1.25rem", maxWidth: "20ch" }}>
            Four modules, three languages
          </h2>
        </div>
        <div className="panel-row">
          {MODULES.map((m) => (
            <article
              key={m.n}
              className="lift"
              style={{ padding: "clamp(40px, 5vw, 64px) clamp(24px, 3vw, 36px)", display: "flex", flexDirection: "column", gap: "1.1rem" }}
            >
              <span className="eyebrow" style={{ color: "var(--accent)" }}>
                Module {m.n}
              </span>
              <h3 className="display-sm">{m.title}</h3>
              <p className="copy-sm" style={{ flex: 1 }}>
                {m.body}
              </p>
              <Link href="/rider/learn" className="cta" style={{ fontSize: "0.6875rem" }}>
                <span>3 lessons</span>
                <span className="cta-ring" style={{ width: "2.375rem", height: "2.375rem", borderColor: "var(--border-strong)" }}>
                  <ArrowRight size={13} />
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════ partners ══ */}
      <section id="products" className="split on-paper scroll-mt-20" style={{ flexDirection: "row-reverse" }}>
        <div className="split-copy">
          <p className="eyebrow eyebrow-rule reveal">The partners</p>
          <h2 className="display-lg reveal" style={{ marginTop: "1.5rem", maxWidth: "12ch" }}>
            Lessons that end in a real account
          </h2>
          <p className="copy reveal" style={{ marginTop: "1.75rem" }}>
            Education on its own changes very little. Every module ends at a product a rider can actually open, with
            an institution that is regulated and accountable.
          </p>
          <div className="reveal" style={{ marginTop: "2.5rem", display: "grid", gap: "1px", background: "var(--paper-rule)" }}>
            {partners.map((p) => (
              <div
                key={p.code}
                style={{ background: "var(--surface)", padding: "1.25rem 0", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1.5rem" }}
              >
                <span>
                  <span className="display-sm" style={{ display: "block" }}>
                    {p.name}
                  </span>
                  {p.tagline ? (
                    <span className="copy-sm" style={{ display: "block", marginTop: "0.35rem" }}>
                      {p.tagline}
                    </span>
                  ) : null}
                </span>
                <span className="figure-sm" style={{ whiteSpace: "nowrap" }}>
                  {p.n}
                  <span className="count-sup">products</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="split-media parallax-media photo-zoom">
          <Photo name="stage" sizes="(max-width: 900px) 100vw, 42vw" />
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════ channels ══ */}
      <section id="channels" className="frame scroll-mt-20" style={{ background: "var(--ground)", borderTop: "1px solid var(--rule)" }}>
        <p className="eyebrow eyebrow-rule reveal">How a rider reaches us</p>
        <div
          className="reveal"
          style={{ marginTop: "clamp(32px, 4vw, 48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1px", background: "var(--rule)" }}
        >
          {[
            { t: "The rider portal", v: "Register in two minutes", href: "/rider/register" },
            { t: "By SMS", v: "The short version of every lesson", href: "/rider" },
            { t: "At the stage", v: "An officer enrols you in person", href: "/rider" },
          ].map((h) => (
            <Link
              key={h.t}
              href={h.href}
              className="lift"
              style={{ background: "var(--ground)", padding: "1.75rem 1.75rem 1.75rem 0", textDecoration: "none", display: "block" }}
            >
              <span className="stat-label">{h.t}</span>
              <span className="display-sm" style={{ display: "block", marginTop: "0.9rem", color: "var(--text)" }}>
                {h.v}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════ closing frame ══ */}
      <section className="frame-hero" style={{ minHeight: "min(70vh, 620px)", alignItems: "center" }}>
        <div className="frame-media parallax-media">
          <Photo name="kenyanPlate" sizes="100vw" />
        </div>
        <div className="scrim scrim-left" />
        <div style={{ paddingInline: "var(--gutter)", maxWidth: "46rem" }}>
          <h2 className="display-lg reveal" style={{ color: "#fff" }}>
            Two minutes to register
          </h2>
          <p className="copy reveal" style={{ marginTop: "1.5rem", color: "rgba(255,255,255,0.78)" }}>
            Then your first lesson, in your own language. No data bundle needed — the short version arrives by SMS.
          </p>
          <Link href="/rider/register" className="btn btn-arrow btn-accent reveal" style={{ marginTop: "2.25rem" }}>
            Jisajili · Register
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ footer ══ */}
      <footer style={{ background: "var(--ground)", borderTop: "1px solid var(--rule)" }}>
        <div
          className="frame-tight"
          style={{ display: "grid", gap: "clamp(32px, 4vw, 56px)", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
        >
          <div style={{ gridColumn: "span 1", minWidth: 0 }}>
            <Logo tone="light" size={30} />
            <p className="copy-sm" style={{ marginTop: "1.25rem", maxWidth: "26ch" }}>
              Financial literacy and formal financial access for Nairobi&rsquo;s boda boda riders, with Stima DT SACCO
              and Britam.
            </p>
            <Link href="/donate" className="cta" style={{ marginTop: "1.5rem", fontSize: "0.6875rem" }}>
              <Heart size={13} />
              <span>Support the work</span>
            </Link>
          </div>

          {[
            { h: "Riders", links: [["Register", "/rider/register"], ["Sign in", "/rider"], ["Lessons", "/rider/learn"], ["Savings goal", "/rider/goal"]] },
            { h: "Programme", links: [["How it works", "/#how"], ["Curriculum", "/#learn"], ["Partners", "/#products"], ["Channels", "/#channels"]] },
            { h: "Team", links: [["Console sign-in", "/login"], ["USSD simulator", "/ussd"]] },
          ].map((col) => (
            <div key={col.h}>
              <div className="stat-label">{col.h}</div>
              <ul style={{ marginTop: "1.1rem", display: "grid", gap: "0.7rem", listStyle: "none", padding: 0 }}>
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="underline-wipe copy-sm" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid var(--rule)",
            paddingInline: "var(--gutter)",
            paddingBlock: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
          }}
        >
          <span className="stat-label">Nairobi, Kenya</span>
          <span className="copy-sm" style={{ fontSize: "0.7rem", color: "var(--on-black-4)" }}>
            Photography: {credits.map((c) => c.credit).join(" · ")} — Unsplash
          </span>
        </div>
      </footer>
    </main>
  );
}
