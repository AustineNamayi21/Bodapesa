import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { showDemoCredentials } from "@/lib/env";
import { HeartHandshake, Lock, Megaphone, Users } from "lucide-react";
import { Logo, Photo } from "@/components/brand";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await ensureSeeded();
  const user = await currentUser();
  if (user) redirect("/admin");

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1fr_1.05fr]">
      <section className="relative hidden lg:block overflow-hidden border-r-[3px]" style={{ borderColor: "var(--ink)" }}>
        <Photo name="skyline" priority sizes="50vw" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(26,18,11,0.2) 0%, rgba(26,18,11,0.85) 75%)" }} />
        <div className="absolute inset-0 p-10 flex flex-col justify-between">
          <Logo tone="light" />
          <div className="animate-rise">
            <h2 className="text-5xl leading-[1.02] max-w-md" style={{ color: "var(--cream)" }}>
              Every rider reached. <span style={{ color: "var(--matatu)" }}>Every lead</span> worked.
            </h2>
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
              {[
                { i: <Users size={18} />, t: "Registry", f: "var(--sunset)" },
                { i: <Megaphone size={18} />, t: "Campaigns", f: "var(--matatu)" },
                { i: <HeartHandshake size={18} />, t: "Leads", f: "var(--mpesa)" },
              ].map((b) => (
                <div key={b.t} className="rounded-2xl p-3 border-2" style={{ background: "rgba(26,18,11,0.55)", borderColor: b.f, color: "var(--cream)" }}>
                  <span style={{ color: b.f }}>{b.i}</span>
                  <div className="text-[0.8rem] font-bold mt-1">{b.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-screen flex items-center justify-center px-4 py-10">
        <div className="absolute inset-0 dots opacity-30" aria-hidden="true" />
        <div className="relative w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-6">
            <Logo />
          </div>

          <div className="card-pop p-7 animate-pop">
            <span className="eyebrow" style={{ color: "var(--brand-strong)" }}>
              <Lock size={13} /> Console
            </span>
            <h1 className="text-3xl mt-2 mb-1">Sign in to the console</h1>
            <p className="text-[0.82rem] text-[var(--text-faint)] mb-6">For the programme team and partner institutions.</p>
            <LoginForm prefill={showDemoCredentials} />
          </div>

          {showDemoCredentials ? (
            <div className="card p-4 mt-5 animate-rise d-2">
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

          <p className="text-center text-[0.78rem] text-[var(--text-faint)] mt-5">
            <Link href="/" className="hover:underline">
              ← Back to the overview
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
