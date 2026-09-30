import Link from "next/link";
import { redirect } from "next/navigation";
import { all } from "@/lib/db";
import { currentRiderId } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { displayMsisdn } from "@/lib/i18n";
import { env } from "@/lib/env";
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
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl grid place-items-center text-lg font-bold mx-auto mb-3"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            B
          </div>
          <h1 className="text-lg font-semibold tracking-tight">BodaPesa</h1>
          <p className="text-[0.82rem] text-[var(--text-muted)] mt-1">
            Jifunze kuhusu pesa. Jiunge na SACCO na bima.
          </p>
          <p className="text-[0.75rem] text-[var(--text-faint)] mt-0.5">
            Learn about money. Join a SACCO and get insured.
          </p>
        </div>

        <div className="card p-5">
          <RiderLogin />
        </div>

        {samples.length ? (
          <div className="card p-4 mt-4">
            <div className="stat-label mb-2">Try it with a registered number</div>
            <div className="space-y-1.5">
              {samples.map((s) => (
                <div key={s.msisdn} className="flex items-center justify-between gap-2 text-[0.78rem]">
                  <span className="text-[var(--text-muted)] truncate">
                    {s.firstName} {s.lastName}
                    <span className="text-[var(--text-faint)]"> · {s.language} · score {s.literacyScore}</span>
                  </span>
                  <code className="text-[0.74rem] shrink-0 tabular-nums">{displayMsisdn(s.msisdn)}</code>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <p className="text-center text-[0.75rem] text-[var(--text-faint)] mt-4">
          Huna simu ya kisasa? Piga <strong className="text-[var(--text)]">*384*14791#</strong> —{" "}
          <Link href="/ussd" className="underline">
            try the USSD menu
          </Link>
        </p>
        <p className="text-center text-[0.75rem] text-[var(--text-faint)] mt-2">
          <Link href="/" className="hover:underline">
            ← Back to the overview
          </Link>
        </p>
      </div>
    </main>
  );
}
