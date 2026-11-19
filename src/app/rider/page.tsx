import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { all } from "@/lib/db";
import { currentRiderId } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { displayMsisdn } from "@/lib/i18n";
import { env } from "@/lib/env";
import { Logo, Photo } from "@/components/brand";
import RiderLogin from "./RiderLogin";

export const dynamic = "force-dynamic";

export default async function RiderEntryPage() {
  await ensureSeeded();
  if (await currentRiderId()) redirect("/rider/home");

  const lessonCount = await all<{ n: number }>("SELECT COUNT(*) AS n FROM Lesson WHERE active = 1");
  const lessons = Number(lessonCount[0]?.n ?? 0);

  // Demo shortcut only: on a deployment holding real riders this would
  // publish their phone numbers.
  const samples = !env.demoMode
    ? []
    : await all<{ msisdn: string; firstName: string; lastName: string; language: string; literacyScore: number }>(
        `SELECT msisdn, firstName, lastName, language, literacyScore
           FROM Rider WHERE status IN ('ACTIVE','ONBOARDED') ORDER BY literacyScore DESC LIMIT 3`,
      );

  return (
    <main style={{ background: "var(--ground)", minHeight: "100vh" }}
      className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
      {/* ── photographic frame ─────────────────────────────────────────── */}
      <section className="frame-hero" style={{ minHeight: "clamp(360px, 46vh, 520px)" }}>
        <div className="frame-media animate-kenburns">
          <Photo name="heroRider" priority sizes="(max-width: 1024px) 100vw, 55vw" />
        </div>
        <div className="scrim" />
        <div style={{ position: "absolute", top: "var(--gutter)", left: "var(--gutter)", zIndex: 1 }}>
          <Logo tone="light" size={30} />
        </div>
        <div style={{ width: "100%", paddingInline: "var(--gutter)", paddingTop: "calc(var(--gutter) + 4.5rem)", paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <p className="eyebrow eyebrow-rule animate-rise" style={{ color: "#fff" }}>
            Bure kabisa · Free
          </p>
          <h1 className="display-xl animate-rise d-1" style={{ marginTop: "1.25rem", color: "#fff", maxWidth: "10ch" }}>
            Karibu, rider
          </h1>
          <p className="copy animate-rise d-2" style={{ marginTop: "1.25rem", color: "rgba(255,255,255,0.76)" }}>
            Jifunze kuhusu pesa. Jiunge na SACCO na bima.
          </p>
          <div
            className="animate-rise d-3"
            style={{ marginTop: "2rem", display: "flex", flexWrap: "wrap", gap: "1px", background: "rgba(255,255,255,0.22)", maxWidth: "30rem" }}
          >
            {[
              { n: String(lessons), label: "Masomo" },
              { n: "3", label: "Lugha" },
              { n: "2", label: "Washirika" },
            ].map((s) => (
              <div key={s.label} style={{ flex: "1 1 100px", padding: "0.9rem 1rem 0.9rem 0", background: "transparent" }}>
                <span className="figure-sm" style={{ color: "#fff" }}>
                  {s.n}
                </span>
                <span className="stat-label" style={{ display: "block", marginTop: "0.4rem", color: "rgba(255,255,255,0.6)" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── sign in ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--ground)",
          borderLeft: "1px solid var(--rule)",
          paddingInline: "var(--gutter)",
          paddingBlock: "clamp(40px, 7vh, 80px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "26rem", marginInline: "auto" }}>
          <p className="eyebrow eyebrow-rule">Ingia · Sign in</p>
          <h2 className="display-md" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
            Nambari yako
          </h2>

          <RiderLogin />

          <Link
            href="/rider/register"
            className="lift"
            style={{
              marginTop: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              padding: "1.4rem",
              border: "1px solid var(--border-strong)",
              textDecoration: "none",
            }}
          >
            <span>
              <span className="eyebrow" style={{ color: "var(--accent)" }}>
                Mgeni hapa? · New here?
              </span>
              <span className="display-sm" style={{ display: "block", marginTop: "0.6rem", color: "var(--text)" }}>
                Jisajili
              </span>
              <span className="copy-sm" style={{ display: "block", marginTop: "0.3rem" }}>
                Dakika mbili. Two minutes.
              </span>
            </span>
            <span className="cta-ring" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
              <ArrowRight size={15} />
            </span>
          </Link>

          {samples.length ? (
            <div style={{ marginTop: "2.5rem", borderTop: "1px solid var(--rule)", paddingTop: "1.25rem" }}>
              <p className="stat-label">Try a registered number</p>
              <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.6rem" }}>
                {samples.map((s) => (
                  <div key={s.msisdn} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: "0.82rem" }}>
                    <span style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.firstName} {s.lastName}
                      <span style={{ color: "var(--text-faint)" }}>
                        {" "}
                        · {s.language} · {s.literacyScore}
                      </span>
                    </span>
                    <code style={{ fontVariantNumeric: "tabular-nums", color: "var(--text)", whiteSpace: "nowrap" }}>
                      {displayMsisdn(s.msisdn)}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <Link href="/" className="cta" style={{ marginTop: "2.5rem", fontSize: "0.6875rem", color: "var(--text-faint)" }}>
            <ArrowLeft size={13} />
            <span>Back to the overview</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
