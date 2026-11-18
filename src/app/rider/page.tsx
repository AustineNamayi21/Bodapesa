import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, PiggyBank, ShieldCheck } from "lucide-react";
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

  // Demo shortcut: a few registered numbers so the portal can be tried
  // immediately. Only in demo mode — on a deployment holding real riders this
  // would publish their phone numbers.
  const samples = !env.demoMode
    ? []
    : await all<{
        msisdn: string;
        firstName: string;
        lastName: string;
        language: string;
        literacyScore: number;
      }>(
        `SELECT msisdn, firstName, lastName, language, literacyScore
           FROM Rider WHERE status IN ('ACTIVE','ONBOARDED') ORDER BY literacyScore DESC LIMIT 3`,
      );

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ── editorial side ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <div className="absolute inset-0 animate-kenburns">
          <Photo name="kenyanPlate" priority sizes="(max-width: 1024px) 100vw, 55vw" />
        </div>
        {/* A scrim rather than a flat wash: the photograph keeps its colour
            at the top, and darkens only where the headline needs contrast. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.22) 26%, rgba(0,0,0,0.66) 56%, rgba(0,0,0,0.90) 100%)",
          }}
        />
        <div className="relative flex flex-col justify-between p-5 sm:p-10 min-h-[38vh] lg:min-h-screen">
          <Logo tone="light" />

          <div className="py-8 lg:py-0 animate-rise">
            <span
              className="pill"
              style={{ background: "var(--ember)", color: "#000", borderColor: "transparent" }}
            >
              Bure kabisa · Free
            </span>
            <h1
              className="mt-4 text-[2.6rem] sm:text-[3.6rem] leading-[0.96] max-w-lg"
              style={{ color: "#fff" }}
            >
              Karibu, rider.
            </h1>
            <p
              className="mt-4 text-[1rem] sm:text-[1.15rem] max-w-md leading-relaxed"
              style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-editorial)" }}
            >
              Jifunze kuhusu pesa. Jiunge na SACCO na bima.
              <span className="block mt-2 opacity-70">Learn about money. Join a SACCO and get insured.</span>
            </p>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 max-w-md">
              {[
                { icon: BookOpen, n: String(lessons), label: "Masomo · Lessons" },
                { icon: PiggyBank, n: "3", label: "Lugha · Languages" },
                { icon: ShieldCheck, n: "2", label: "Washirika · Partners" },
              ].map(({ icon: Icon, n, label }) => (
                <div key={label} style={{ borderTop: "2px solid var(--ember)", paddingTop: "0.6rem" }}>
                  <div className="flex items-baseline gap-1.5">
                    <Icon size={14} style={{ color: "var(--ember)" }} />
                    <span className="stat-value text-[1.6rem]" style={{ color: "#fff" }}>
                      {n}
                    </span>
                  </div>
                  <div
                    className="text-[0.58rem] uppercase mt-1"
                    style={{
                      letterSpacing: "0.16em",
                      fontFamily: "var(--font-display)",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="hidden lg:block text-[0.68rem]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Stima DT SACCO · Britam
          </p>
        </div>
      </section>

      {/* ── sign-in side ─────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-14 py-10 lg:py-14 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="rule-head mb-5">
            <h2 className="text-[1.5rem] leading-none">Ingia</h2>
            <span className="eyebrow">Sign in</span>
          </div>

          <RiderLogin />

          {/* The registration route — the primary way a new rider joins now
              that USSD onboarding is out of scope. */}
          <Link
            href="/rider/register"
            className="mt-6 flex items-center justify-between gap-3 p-4 lift"
            style={{ border: "2px solid var(--ink)", background: "var(--surface)" }}
          >
            <span>
              <span
                className="block text-[0.58rem] uppercase"
                style={{
                  letterSpacing: "0.18em",
                  fontFamily: "var(--font-display)",
                  color: "var(--ember-deep)",
                  fontWeight: 600,
                }}
              >
                Mgeni hapa? · New here?
              </span>
              <span
                className="block text-[1.05rem] mt-1"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}
              >
                Jisajili · Register
              </span>
              <span className="block text-[0.74rem] mt-0.5" style={{ color: "var(--text-faint)" }}>
                Dakika mbili. Two minutes.
              </span>
            </span>
            <ArrowRight size={20} className="shrink-0" style={{ color: "var(--ember-deep)" }} />
          </Link>

          {samples.length ? (
            <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="stat-label mb-2.5">Try it with a registered number</div>
              <div className="space-y-1.5">
                {samples.map((s) => (
                  <div key={s.msisdn} className="flex items-center justify-between gap-2 text-[0.8rem]">
                    <span className="truncate" style={{ color: "var(--text-muted)" }}>
                      {s.firstName} {s.lastName}
                      <span style={{ color: "var(--text-faint)" }}>
                        {" "}
                        · {s.language} · {s.literacyScore}
                      </span>
                    </span>
                    <code
                      className="text-[0.74rem] shrink-0 tabular-nums font-bold px-2 py-0.5"
                      style={{ background: "var(--surface-2)" }}
                    >
                      {displayMsisdn(s.msisdn)}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <p className="text-[0.74rem] mt-7" style={{ color: "var(--text-faint)" }}>
            <Link href="/" className="underline-wipe">
              ← Back to the overview
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
