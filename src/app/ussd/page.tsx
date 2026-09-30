import Link from "next/link";
import { all } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { displayMsisdn } from "@/lib/i18n";
import { env } from "@/lib/env";
import Handset from "./Handset";

export const dynamic = "force-dynamic";

export default async function UssdPage() {
  await ensureSeeded();

  // Listing registered numbers is a demo convenience only (see env.demoMode).
  const registered = !env.demoMode ? [] : await all<{ msisdn: string; firstName: string; lastName: string; language: string }>(
    `SELECT msisdn, firstName, lastName, language FROM Rider
      WHERE status IN ('ACTIVE','ONBOARDED') ORDER BY literacyScore DESC LIMIT 4`,
  );

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-[0.78rem] text-[var(--text-faint)] hover:underline">
          ← BodaPesa
        </Link>
        <h1 className="text-xl font-semibold tracking-tight mt-1">USSD simulator — *384*14791#</h1>
        <p className="text-[0.85rem] text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
          This is the channel that reaches every rider. No smartphone, no data bundle, no app — just a number
          dialled on any handset. The simulator runs the same menu engine that the Africa&rsquo;s Talking
          callback at <code className="text-[0.78rem]">/api/ussd</code> uses, so what you see here is exactly what a
          rider sees on their phone. Riders registered here are marked as demonstration riders and are never sent a
          real message.
        </p>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] mt-6 items-start">
          <Handset registered={registered.map((r) => ({ ...r, display: displayMsisdn(r.msisdn) }))} />

          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold tracking-tight mb-3">The menu</h2>
              <ul className="space-y-2.5 text-[0.82rem]">
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
                  <li key={m.n} className="flex gap-3">
                    <span
                      className="w-5 h-5 rounded grid place-items-center text-[0.7rem] font-bold shrink-0 mt-0.5"
                      style={{ background: "var(--brand-soft)", color: "var(--brand-strong)" }}
                    >
                      {m.n}
                    </span>
                    <span>
                      <span className="font-medium block">{m.t}</span>
                      <span className="text-[0.78rem] text-[var(--text-muted)] leading-relaxed">{m.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold tracking-tight mb-2">Try this first</h2>
              <ol className="space-y-1.5 text-[0.82rem] text-[var(--text-muted)] list-decimal list-inside">
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

            <div className="card p-5">
              <h2 className="font-semibold tracking-tight mb-2">Going live</h2>
              <p className="text-[0.82rem] text-[var(--text-muted)] leading-relaxed">
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
