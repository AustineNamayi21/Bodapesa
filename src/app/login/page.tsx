import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { showDemoCredentials } from "@/lib/env";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await ensureSeeded();
  const user = await currentUser();
  if (user) redirect("/admin");

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-6 justify-center">
          <div
            className="w-8 h-8 rounded-lg grid place-items-center text-sm font-bold"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            B
          </div>
          <span className="font-semibold tracking-tight">BodaPesa</span>
        </Link>

        <div className="card p-6">
          <h1 className="font-semibold tracking-tight mb-1">Sign in to the console</h1>
          <p className="text-xs text-[var(--text-faint)] mb-5">
            For the programme team and partner institutions.
          </p>
          <LoginForm prefill={showDemoCredentials} />
        </div>

        {showDemoCredentials ? (
        <div className="card p-4 mt-4">
          <div className="stat-label mb-2">Demo accounts</div>
          <div className="space-y-2 text-[0.78rem]">
            {[
              { role: "Platform admin", email: "admin@bodapesa.ke", pass: "bodapesa2026" },
              { role: "Stima SACCO", email: "sacco@stima.co.ke", pass: "stima2026" },
              { role: "Britam", email: "agent@britam.co.ke", pass: "britam2026" },
            ].map((a) => (
              <div key={a.email} className="flex items-center justify-between gap-2">
                <span className="text-[var(--text-faint)]">{a.role}</span>
                <code className="text-[0.72rem]">
                  {a.email} / {a.pass}
                </code>
              </div>
            ))}
          </div>
        </div>
        ) : null}

        <p className="text-center text-[0.75rem] text-[var(--text-faint)] mt-4">
          <Link href="/" className="hover:underline">
            ← Back to the overview
          </Link>
        </p>
      </div>
    </main>
  );
}
