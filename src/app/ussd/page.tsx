import Link from "next/link";
import { all } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { displayMsisdn } from "@/lib/i18n";
import { env } from "@/lib/env";
import Handset from "./Handset";
import { USSD_CODE } from "@/lib/ussd-code";
import { Logo, Photo } from "@/components/brand";

export const dynamic = "force-dynamic";

export default async function UssdPage() {
  await ensureSeeded();

  // Listing registered numbers is a demo convenience only (see env.demoMode).
  const registered = !env.demoMode ? [] : await all<{ msisdn: string; firstName: string; lastName: string; language: string }>(
    `SELECT msisdn, firstName, lastName, language FROM Rider
      WHERE status IN ('ACTIVE','ONBOARDED') ORDER BY literacyScore DESC LIMIT 4`,
  );

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b-[3px]" style={{ borderColor: "var(--ink)" }}>
        <Photo name="mirror" priority sizes="100vw" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(26,18,11,0.95) 30%, rgba(26,18,11,0.6) 70%, rgba(16,178,108,0.35))" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-10">
          <div className="flex items-center justify-between">
            <Logo tone="light" />
            <Link href="/rider" className="btn btn-sm" style={{ background: "rgba(255,243,228,0.12)", color: "var(--cream)", borderColor: "rgba(255,243,228,0.3)" }}>
              Rider portal →
            </Link>
          </div>
          <span className="sticker mt-8" style={{ background: "var(--mpesa)", color: "#fff" }}>
            No data · No smartphone · Free
          </span>
          <h1 className="mt-4 text-4xl sm:text-6xl leading-[1.02] max-w-3xl" style={{ color: "var(--cream)" }}>
            Dial <span className="font-mono" style={{ color: "var(--matatu)" }}>{USSD_CODE}</span>
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed" style={{ color: "rgba(255,243,228,0.8)" }}>
            The channel that reaches every rider — even on a mulika mwizi. This simulator runs the same menu engine as the
            Africa&rsquo;s Talking callback at <code className="font-mono text-[0.85em]">/api/ussd</code>, so what you see is exactly
            what a rider sees. Riders registered here are demonstration riders and are never sent a real message.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr] items-start">
          <Handset registered={registered.map((r) => ({ ...r, display: displayMsisdn(r.msisdn) }))} />

          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="text-2xl mb-4">The menu</h2>
              <ul className="grid sm:grid-cols-2 gap-3 text-[0.82rem]">
                {[
                  {
                    n: "1",
                    t: "Jifunze kuhusu pesa — Learn",
                    d: "Four modules, twelve lessons, each condensed to a single USSD screen with a two-question quiz. Completing a lesson raises the rider's literacy score exactly as it does in the app.",
                  },
                  {
                    n: "2",
                    t: "Bidhaa za kifedha — Products",
                    d: "Browse Stima SACCO and Britam products by category, read a plain-language summary, and request a callback. Choosing “I'm interested” creates a real lead in the partner pipeline.",
                  },
                  {
                    n: "3",
                    t: "Akiba yangu — Savings goal",
                    d: "Set a goal from a preset, see progress, and record a deposit — all in numbers typed on a keypad.",
                  },
                  { n: "4", t: "Ujumbe wangu — Messages", d: "The last three campaign messages sent to this rider." },
                  { n: "5", t: "Wasifu wangu — Profile", d: "Stage, lessons completed and current literacy score." },
                  { n: "6", t: "Badilisha lugha — Language", d: "Switch between Kiswahili, English and Sheng at any time." },
                ].map((m) => (
                  <li key={m.n} className="flex gap-3 rounded-2xl p-3 lift" style={{ background: "var(--surface-2)" }}>
                    <span
                      className="w-8 h-8 rounded-xl grid place-items-center text-[0.9rem] font-extrabold shrink-0 border-2"
                      style={{ background: ["var(--sunset)", "var(--matatu)", "var(--mpesa)", "var(--sky)", "var(--kanga)", "var(--sunset)"][Number(m.n) - 1], color: "var(--ink)", borderColor: "var(--ink)" }}
                    >
                      {m.n}
                    </span>
                    <span>
                      <span className="font-bold block">{m.t}</span>
                      <span className="text-[0.78rem] text-[var(--text-muted)] leading-relaxed">{m.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="text-2xl mb-3">Try this first 👇</h2>
              <ol className="space-y-2 text-[0.86rem] text-[var(--text-muted)] list-decimal list-inside marker:font-extrabold marker:text-[var(--brand-strong)]">
                <li>
                  Dial with an <strong className="text-[var(--text)]">unregistered</strong> number — the menu
                  walks you through choosing a language, giving your name and picking your stage, and creates a
                  real rider record.
                </li>
                <li>
                  Dial again with that same number and the main menu appears, now in the language you chose.
                </li>
                <li>Press 1 → 1 → 1 to read the first savings lesson, then 1 again to take its quiz.</li>
                <li>
                  Press 2 → 3 → 1 → 1 to request a Britam insurance product, then open the{" "}
                  <Link href="/admin/leads" className="underline">
                    lead pipeline
                  </Link>{" "}
                  to see it arrive.
                </li>
              </ol>
            </div>

            <div className="rounded-[var(--radius)] p-5" style={{ background: "var(--ink)", color: "var(--cream)" }}>
              <h2 className="text-2xl mb-2" style={{ color: "var(--matatu)" }}>Going live</h2>
              <p className="text-[0.84rem] leading-relaxed" style={{ color: "rgba(255,243,228,0.78)" }}>
                Register a USSD service code with Africa&rsquo;s Talking and point its callback at{" "}
                <code className="text-[0.78rem]">https://your-domain/api/ussd</code>. The endpoint already
                speaks the required format — form-encoded{" "}
                <code className="text-[0.78rem]">sessionId, phoneNumber, text, serviceCode</code> in, plain text
                beginning <code className="text-[0.78rem]">CON</code> or{" "}
                <code className="text-[0.78rem]">END</code> out — so no application code changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
