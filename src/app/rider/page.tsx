import Link from "next/link";
import { redirect } from "next/navigation";
import { Hash, PiggyBank, ShieldCheck, BookOpen } from "lucide-react";
import { all } from "@/lib/db";
import { currentRiderId } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { displayMsisdn } from "@/lib/i18n";
import { env } from "@/lib/env";
import { USSD_CODE } from "@/lib/ussd-code";
import { Logo, Photo, IconBadge } from "@/components/brand";
import RiderLogin from "./RiderLogin";

export const dynamic = "force-dynamic";

export default async function RiderEntryPage() {
  await ensureSeeded();
  if (await currentRiderId()) redirect("/rider/home");

  // Demo shortcut: a few registered numbers so the portal can be tried
  // immediately. Only in demo mode — on a deployment holding real riders this
  // would publish their phone numbers.
  const samples = !env.demoMode ? [] : await all<{ msisdn: string; firstName: string; lastName: string; language: string; literacyScore: number }>(
    `SELECT msisdn, firstName, lastName, language, literacyScore
       FROM Rider WHERE status IN ('ACTIVE','ONBOARDED') ORDER BY literacyScore DESC LIMIT 3`,
  );

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* photo side */}
      <section className="relative min-h-[46vh] lg:min-h-screen overflow-hidden">
        <Photo name="kenyanPlate" priority sizes="(max-width: 1024px) 100vw, 55vw" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(26,18,11,0.35) 0%, rgba(26,18,11,0.2) 40%, rgba(26,18,11,0.92) 100%)" }}
        />
        <div className="relative h-full flex flex-col justify-between p-5 sm:p-8 min-h-[46vh] lg:min-h-screen">
          <Logo tone="light" />
          <div className="pb-6 lg:pb-10 animate-rise">
            <span className="sticker" style={{ background: "var(--mpesa)" }}>
              Bure kabisa · Free
            </span>
            <h1 className="mt-4 text-[2.5rem] sm:text-6xl leading-[1] max-w-lg" style={{ color: "var(--cream)" }}>
              Karibu, <span style={{ color: "var(--matatu)" }}>rider.</span>
            </h1>
            <p className="mt-3 text-[0.95rem] sm:text-lg max-w-md" style={{ color: "rgba(255,243,228,0.85)" }}>
              Jifunze kuhusu pesa. Jiunge na SACCO na bima.
              <br />
              <span className="opacity-75">Learn about money. Join a SACCO and get insured.</span>
            </p>
            <div className="mt-5 hidden sm:flex flex-wrap gap-2">
              {[
                { i: <BookOpen size={15} />, t: "12 lessons", f: "var(--matatu)" },
                { i: <PiggyBank size={15} />, t: "Savings jar", f: "var(--mpesa)" },
                { i: <ShieldCheck size={15} />, t: "Real products", f: "var(--kanga)" },
              ].map((b) => (
                <span key={b.t} className="pill py-1.5 px-3 border-2" style={{ background: "rgba(26,18,11,0.55)", color: "var(--cream)", borderColor: b.f }}>
                  <span style={{ color: b.f }}>{b.i}</span> {b.t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* form side */}
      <section className="relative px-4 sm:px-8 py-10 flex items-center justify-center">
        <div className="absolute inset-0 dots opacity-30" aria-hidden="true" />
        <div className="relative w-full max-w-sm -mt-20 lg:mt-0">
          <div className="card-pop p-6 animate-pop">
            <div className="flex items-center gap-3 mb-5">
              <IconBadge fill="var(--sunset)" size={42} rotate={-6}>
                <span className="font-display font-extrabold text-lg">📱</span>
              </IconBadge>
              <div>
                <h2 className="text-xl leading-tight">Ingia · Sign in</h2>
                <p className="text-[0.76rem] text-[var(--text-faint)]">Tumia nambari yako ya simu</p>
              </div>
            </div>
            <RiderLogin />
          </div>

          {samples.length ? (
            <div className="card p-4 mt-5 animate-rise d-2">
              <div className="stat-label mb-2">Try it with a registered number</div>
              <div className="space-y-2">
                {samples.map((s) => (
                  <div key={s.msisdn} className="flex items-center justify-between gap-2 text-[0.8rem]">
                    <span className="text-[var(--text-muted)] truncate">
                      {s.firstName} {s.lastName}
                      <span className="text-[var(--text-faint)]"> · {s.language} · {s.literacyScore}</span>
                    </span>
                    <code className="text-[0.76rem] shrink-0 tabular-nums font-bold px-2 py-0.5 rounded-md" style={{ background: "var(--accent-soft)" }}>
                      {displayMsisdn(s.msisdn)}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <Link
            href="/ussd"
            className="mt-5 flex items-center gap-3 rounded-2xl p-3.5 border-2 border-dashed lift animate-rise d-3"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <IconBadge fill="var(--mpesa)" size={38}>
              <Hash size={18} />
            </IconBadge>
            <span className="text-[0.8rem] leading-snug">
              <strong>Huna simu ya kisasa?</strong> Piga <strong className="font-mono">{USSD_CODE}</strong>
              <span className="block text-[var(--text-faint)]">No smartphone? Try the USSD menu →</span>
            </span>
          </Link>

          <p className="text-center text-[0.75rem] text-[var(--text-faint)] mt-5">
            <Link href="/" className="hover:underline">
              ← Back to the overview
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
