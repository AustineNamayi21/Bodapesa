import Link from "next/link";
import { ensureSeeded } from "@/lib/seed";
import { kpis } from "@/lib/analytics";
import { providerStatus } from "@/lib/channels/providers";
import { count } from "@/lib/db";
import { ModePill } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureSeeded();
  const k = await kpis();
  const stages = await count("SELECT COUNT(*) AS n FROM Stage");
  const products = await count("SELECT COUNT(*) AS n FROM Product WHERE active = 1");
  const providers = providerStatus();

  const entries = [
    {
      href: "/admin",
      eyebrow: "For the programme team & partners",
      title: "Admin console",
      body: "Rider registry, campaign composer, partner lead pipeline and the impact dashboard. Sign in with the demo credentials shown on the login page.",
      cta: "Open the console",
      tone: "brand",
    },
    {
      href: "/rider",
      eyebrow: "For riders with a smartphone",
      title: "Rider portal",
      body: "The mobile-first rider experience: twelve financial literacy lessons in three languages, quizzes, a savings goal tracker and the partner product catalogue.",
      cta: "Enter the portal",
      tone: "accent",
    },
    {
      href: "/ussd",
      eyebrow: "For riders on any handset",
      title: "USSD simulator",
      body: "The *384*7788# menu exactly as a rider on a feature phone experiences it — register, learn, take a quiz and request a product without data or a smartphone.",
      cta: "Dial the short code",
      tone: "info",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* ------------------------------------------------------------ hero */}
      <header className="border-b" style={{ background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-8 h-8 rounded-lg grid place-items-center text-sm font-bold"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              B
            </div>
            <span className="font-semibold tracking-tight">BodaPesa</span>
            <span className="pill ml-1" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              Final year project
            </span>
          </div>

          <h1 className="text-3xl sm:text-[2.6rem] font-semibold tracking-tight leading-[1.12] max-w-3xl">
            Financial literacy and formal financial access for Nairobi&rsquo;s boda boda riders.
          </h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--text-muted)] max-w-2xl">
            Riders handle cash every day and are almost entirely outside the formal financial system. BodaPesa
            delivers a structured curriculum on savings, credit, investment and insurance over SMS, USSD,
            WhatsApp and an in-app portal — then connects riders directly to real products from{" "}
            <strong className="text-[var(--text)] font-semibold">Stima DT SACCO</strong> and{" "}
            <strong className="text-[var(--text)] font-semibold">Britam</strong>, and hands qualified leads
            back to those institutions.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {[
              { label: "Riders registered", value: k.riders.toLocaleString() },
              { label: "Messages delivered", value: k.messagesSent.toLocaleString() },
              { label: "Stages covered", value: stages },
              { label: "Partner products", value: products },
            ].map((s) => (
              <div key={s.label} className="card p-3">
                <div className="stat-value text-xl">{s.value}</div>
                <div className="stat-label mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------- entries */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {entries.map((e) => (
            <Link key={e.href} href={e.href} className="card p-5 flex flex-col group hover:border-[var(--brand)] transition-colors">
              <div
                className="pill self-start mb-3"
                style={{
                  background: e.tone === "brand" ? "var(--brand-soft)" : e.tone === "accent" ? "var(--accent-soft)" : "var(--info-soft)",
                  color: e.tone === "brand" ? "var(--brand-strong)" : e.tone === "accent" ? "var(--accent)" : "var(--info)",
                }}
              >
                {e.eyebrow}
              </div>
              <h2 className="font-semibold tracking-tight mb-2">{e.title}</h2>
              <p className="text-[0.82rem] leading-relaxed text-[var(--text-muted)] flex-1">{e.body}</p>
              <span className="mt-4 text-[0.82rem] font-semibold" style={{ color: "var(--brand)" }}>
                {e.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- how it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
        <div className="card p-5 sm:p-6">
          <h2 className="font-semibold tracking-tight mb-1">How the platform works</h2>
          <p className="text-xs text-[var(--text-faint)] mb-5">
            Four stages, each measured — the funnel on the dashboard tracks riders through every one.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Register & consent",
                d: "Riders are enrolled at their stage, through the USSD short code, or by replying to an SMS. Language, preferred channel and a financial-inclusion baseline are captured, and no message is ever sent without explicit consent.",
              },
              {
                n: "02",
                t: "Learn",
                d: "Twelve lessons across savings, credit, investment and insurance, each written in English, Kiswahili and Sheng, and each condensed to a single SMS screen so the curriculum reaches feature phones too.",
              },
              {
                n: "03",
                t: "Be reached",
                d: "The campaign engine segments the register by stage, language, literacy score and inclusion status, then dispatches over the channel each rider actually prefers — tracking delivery and cost per message.",
              },
              {
                n: "04",
                t: "Be onboarded",
                d: "A rider who requests a product generates a lead routed straight to Stima SACCO or Britam, who work it through to conversion inside the partner pipeline.",
              },
            ].map((s) => (
              <div key={s.n}>
                <div className="text-[0.7rem] font-bold tracking-widest mb-2" style={{ color: "var(--accent)" }}>
                  {s.n}
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{s.t}</h3>
                <p className="text-[0.8rem] leading-relaxed text-[var(--text-muted)]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- channels */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-1">Channel adapters</h2>
          <p className="text-xs text-[var(--text-faint)] mb-4">
            Each channel is a pluggable adapter. Without API credentials a channel is simulated —
            messages are still persisted, costed and reported, so the whole system is demonstrable offline.
            Add credentials to <code className="text-[0.75rem]">.env</code> and the same code goes live.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {providers.map((p) => (
              <div key={p.channel} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-[0.7rem] text-[var(--text-faint)]">{p.channel}</div>
                </div>
                <ModePill mode={p.mode} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-[0.75rem] text-[var(--text-faint)] flex flex-wrap gap-x-4 gap-y-1 justify-between">
          <span>BodaPesa — financial literacy platform for boda boda riders, Nairobi.</span>
          <span>Partner product figures are indicative and must be confirmed with the institutions.</span>
        </div>
      </footer>
    </main>
  );
}
