import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Hash,
  HandCoins,
  HeartHandshake,
  Landmark,
  MessageCircle,
  MessageSquareText,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Umbrella,
  Users,
} from "lucide-react";
import { ensureSeeded } from "@/lib/seed";
import { kpis } from "@/lib/analytics";
import { providerStatus } from "@/lib/channels/providers";
import { all, count } from "@/lib/db";
import { USSD_CODE } from "@/lib/ussd-code";
import { PHOTOS } from "@/lib/photos";
import { ModePill } from "@/components/ui";
import { BodaRider, Blobs, IconBadge, Logo, Marquee, Photo } from "@/components/brand";
import { CountUp } from "@/components/motion";

export const dynamic = "force-dynamic";

const TICKER = [
  "Weka akiba kwanza",
  "Save first, spend second",
  "Bima ya abiria",
  "Passenger cover",
  "Hisa za SACCO",
  "Mkopo bila riba ya 1% kwa siku",
  "Invest in your own bike",
  "Pensheni ya kesho",
  "Jifunze kwa Kiswahili, English ama Sheng",
];

export default async function Home() {
  await ensureSeeded();
  const k = await kpis();
  const stages = await count("SELECT COUNT(*) AS n FROM Stage");
  const products = await count("SELECT COUNT(*) AS n FROM Product WHERE active = 1");
  const lessons = await count("SELECT COUNT(*) AS n FROM Lesson WHERE active = 1");
  const partners = await all<{ name: string; code: string; n: number }>(
    `SELECT pt.name, pt.code, COUNT(p.id) AS n FROM Partner pt
       LEFT JOIN Product p ON p.partnerId = pt.id AND p.active = 1
      GROUP BY pt.id, pt.name, pt.code ORDER BY pt.name`,
  );
  const providers = providerStatus();
  const credits = Object.values(PHOTOS).filter((p, i, arr) => arr.findIndex((q) => q.credit === p.credit) === i);

  return (
    <main className="min-h-screen overflow-x-clip">
      {/* ─────────────────────────────────────────────────────────── nav ── */}
      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: "color-mix(in oklab, var(--bg) 82%, transparent)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Logo size={34} />
          <nav className="hidden md:flex items-center gap-6 text-[0.85rem] font-semibold text-[var(--text-muted)]">
            <a href="#how" className="hover:text-[var(--text)]">How it works</a>
            <a href="#learn" className="hover:text-[var(--text)]">Curriculum</a>
            <a href="#channels" className="hover:text-[var(--text)]">Channels</a>
            <a href="#partners" className="hover:text-[var(--text)]">Partners</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              Console
            </Link>
            <Link href="/rider" className="btn btn-primary btn-sm">
              Rider portal <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="stripe stripe-animated" />
      </header>

      {/* ────────────────────────────────────────────────────────── hero ── */}
      <section className="relative">
        <Blobs />
        <div className="absolute inset-0 dots opacity-40" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <span className="sticker animate-pop" style={{ ["--r" as string]: "-2deg" }}>
              <Sparkles size={15} /> Kwa wanabodaboda wa Nairobi
            </span>

            <h1 className="mt-6 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.3rem] tracking-tight animate-rise">
              Every shilling you ride for,{" "}
              <span className="highlight">working</span> for you.
            </h1>

            <p className="mt-5 text-xl sm:text-2xl font-display font-bold animate-rise d-2" style={{ color: "var(--brand-strong)" }}>
              Jifunze. Weka akiba. Jikinge.
            </p>

            <p className="mt-4 text-[1rem] leading-relaxed text-[var(--text-muted)] max-w-xl animate-rise d-3">
              Free, bite-sized money lessons for boda boda riders — in Kiswahili, English and Sheng, on any phone. Then a
              direct line to real savings, loans and insurance from <strong className="text-[var(--text)]">Stima DT SACCO</strong>{" "}
              and <strong className="text-[var(--text)]">Britam</strong>.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 animate-rise d-4">
              <Link href="/rider" className="btn btn-primary btn-lg">
                Start learning — it&rsquo;s free <ArrowRight size={18} />
              </Link>
              <Link href="/ussd" className="btn btn-ghost btn-lg font-mono">
                <Hash size={17} /> Dial {USSD_CODE}
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl stagger">
              {[
                { label: "Riders registered", value: k.riders, colour: "var(--sunset)" },
                { label: "Messages sent", value: k.messagesSent, colour: "var(--mpesa)" },
                { label: "Stages reached", value: stages, colour: "var(--sky)" },
                { label: "Partner products", value: products, colour: "var(--kanga)" },
              ].map((s) => (
                <div key={s.label} className="card p-3.5 relative overflow-hidden">
                  <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: s.colour }} />
                  <dd className="stat-value text-[1.6rem]">
                    <CountUp value={s.value} />
                  </dd>
                  <dt className="stat-label mt-0.5">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* photo collage */}
          <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
            <div
              className="relative aspect-[4/5] rounded-[28px] overflow-hidden border-[3px] animate-pop"
              style={{ borderColor: "var(--ink)", boxShadow: "12px 12px 0 var(--sunset)" }}
            >
              <Photo name="heroRider" priority sizes="(max-width: 1024px) 90vw, 480px" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(26,18,11,0.55))" }} />
              <div className="absolute bottom-4 left-4 right-4 text-[0.72rem] font-semibold text-white/85">
                Photo: {PHOTOS.heroRider.credit} / Unsplash
              </div>
            </div>

            {/* floating stickers */}
            <div
              className="absolute left-2 sm:-left-10 top-10 card-pop px-3.5 py-2.5 flex items-center gap-2.5 animate-float"
              style={{ ["--r" as string]: "-4deg" }}
            >
              <IconBadge fill="var(--mpesa)" size={34}>
                <PiggyBank size={18} />
              </IconBadge>
              <div className="leading-tight">
                <div className="text-[0.66rem] font-bold uppercase tracking-wider text-[var(--text-faint)]">Leo umeweka</div>
                <div className="font-display font-extrabold text-lg">KSh 100</div>
              </div>
            </div>

            <div
              className="absolute right-2 sm:-right-8 top-[44%] card-pop px-3.5 py-2.5 flex items-center gap-2.5 animate-float"
              style={{ ["--r" as string]: "3deg", animationDelay: "-2s" }}
            >
              <IconBadge fill="var(--kanga)" size={34}>
                <ShieldCheck size={18} color="#fff" />
              </IconBadge>
              <div className="leading-tight">
                <div className="text-[0.66rem] font-bold uppercase tracking-wider text-[var(--text-faint)]">Bima</div>
                <div className="font-bold text-[0.9rem]">Passenger covered ✓</div>
              </div>
            </div>

            <div
              className="absolute left-2 sm:-left-6 bottom-12 max-w-[230px] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[0.8rem] font-medium animate-float border-2"
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                borderColor: "var(--ink)",
                ["--r" as string]: "-2deg",
                animationDelay: "-3.5s",
              }}
            >
              <span className="text-[0.62rem] font-bold uppercase tracking-wider" style={{ color: "var(--matatu)" }}>
                SMS · BodaPesa
              </span>
              <br />
              Somo la 3 liko tayari: &ldquo;1% kwa siku ni 365% kwa mwaka.&rdquo;
            </div>
          </div>
        </div>

        {/* the road */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden" aria-hidden="true">
          <div className="absolute bottom-3 left-0 right-0 border-t-[3px] border-dashed" style={{ borderColor: "color-mix(in oklab, var(--ink) 30%, transparent)" }} />
          <div className="absolute bottom-3.5" style={{ animation: "ride 14s linear infinite" }}>
            <BodaRider size={64} />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── ticker ── */}
      <div className="py-4 font-display font-extrabold text-lg sm:text-2xl uppercase tracking-tight" style={{ background: "var(--ink)", color: "var(--cream)" }}>
        <Marquee items={TICKER} />
      </div>

      {/* ───────────────────────────────────────────────────── the problem ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative reveal">
          <div className="relative aspect-[5/4] rounded-[28px] overflow-hidden border-[3px] photo-zoom" style={{ borderColor: "var(--ink)", boxShadow: "-12px 12px 0 var(--matatu)" }}>
            <Photo name="resting" sizes="(max-width: 1024px) 90vw, 560px" />
          </div>
          <div
            className="absolute -bottom-6 right-4 sticker animate-wiggle"
            style={{ background: "var(--sunset)" }}
          >
            Cash in, cash out — every single day
          </div>
        </div>

        <div>
          <span className="eyebrow" style={{ color: "var(--brand-strong)" }}>
            <span className="w-6 h-[3px] rounded" style={{ background: "var(--sunset)" }} /> The problem
          </span>
          <h2 className="mt-3 text-3xl sm:text-[2.6rem] leading-[1.08]">
            Riders move Nairobi. The financial system barely sees them.
          </h2>
          <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
            Income arrives daily, not monthly — which fits none of the products banks and insurers are built around. So the
            gaps compound, quietly, one bad afternoon at a time.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-3 stagger">
            {[
              { icon: <PiggyBank size={20} />, fill: "var(--mpesa)", t: "No cushion", d: "A puncture or a fine is met with a 1%-a-day mobile loan, not savings." },
              { icon: <Umbrella size={20} />, fill: "var(--kanga)", t: "No cover", d: "Third-party only — the passenger and the rider himself are unprotected." },
              { icon: <Landmark size={20} />, fill: "var(--sky)", t: "No record", d: "Years of reliable earnings, and no credit history to show for them." },
              { icon: <TrendingUp size={20} />, fill: "var(--matatu)", t: "No pension", d: "Riding has a short physical window. Nobody is building the after." },
            ].map((p) => (
              <div key={p.t} className="card p-4 lift">
                <IconBadge fill={p.fill} size={40}>
                  {p.icon}
                </IconBadge>
                <h3 className="mt-3 text-lg">{p.t}</h3>
                <p className="mt-1 text-[0.84rem] leading-relaxed text-[var(--text-muted)]">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── how it works ── */}
      <section id="how" className="relative py-20" style={{ background: "var(--surface-2)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto reveal">
            <span className="eyebrow" style={{ color: "var(--success)" }}>
              <span className="w-6 h-[3px] rounded" style={{ background: "var(--mpesa)" }} /> The journey
            </span>
            <h2 className="mt-3 text-3xl sm:text-[2.6rem] leading-[1.08]">From the stage to the SACCO in four stops</h2>
          </div>

          <div className="relative mt-14">
            <div
              className="hidden lg:block absolute top-8 left-[12%] right-[12%] border-t-[3px] border-dashed"
              style={{ borderColor: "var(--border-strong)" }}
              aria-hidden="true"
            />
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
              {[
                {
                  icon: <Users size={24} />,
                  fill: "var(--sunset)",
                  t: "Register & consent",
                  d: "At the stage with a field officer, by dialling the USSD code, or by texting JIUNGE. Nothing is sent without a clear yes.",
                },
                {
                  icon: <BookOpen size={24} />,
                  fill: "var(--matatu)",
                  t: "Learn",
                  d: `${lessons} short lessons with quizzes — savings, credit, investment, insurance — each one small enough for a single SMS.`,
                },
                {
                  icon: <MessageSquareText size={24} />,
                  fill: "var(--mpesa)",
                  t: "Be reached",
                  d: "Campaigns land on the channel each rider prefers, in their language, targeted to the gaps they actually have.",
                },
                {
                  icon: <HeartHandshake size={24} />,
                  fill: "var(--kanga)",
                  t: "Be onboarded",
                  d: "One tap on “Ninavutiwa” and an officer from Stima SACCO or Britam calls back within two working days.",
                },
              ].map((s, i) => (
                <li key={s.t} className="text-center reveal">
                  <div className="relative inline-block">
                    <IconBadge fill={s.fill} size={64} rotate={i % 2 ? 4 : -4}>
                      {s.icon}
                    </IconBadge>
                    <span
                      className="absolute -top-2 -right-3 w-7 h-7 rounded-full grid place-items-center text-[0.75rem] font-extrabold border-2"
                      style={{ background: "var(--surface)", borderColor: "var(--ink)" }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl">{s.t}</h3>
                  <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--text-muted)] max-w-[260px] mx-auto">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────── curriculum ── */}
      <section id="learn" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 reveal">
          <div className="max-w-xl">
            <span className="eyebrow" style={{ color: "var(--info)" }}>
              <span className="w-6 h-[3px] rounded" style={{ background: "var(--sky)" }} /> The curriculum
            </span>
            <h2 className="mt-3 text-3xl sm:text-[2.6rem] leading-[1.08]">Four modules. Real numbers. Street language.</h2>
          </div>
          <Link href="/rider" className="btn btn-accent">
            Try a lesson <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { key: "market" as const, fill: "var(--mpesa)", icon: <PiggyBank size={20} />, t: "Akiba", en: "Savings", d: "Save first, not last. KSh 100 a day is KSh 36,000 a year." },
            { key: "vendor" as const, fill: "var(--sunset)", icon: <HandCoins size={20} />, t: "Mikopo", en: "Credit", d: "What 1% a day really costs — and loans that build instead of eat." },
            { key: "skyline" as const, fill: "var(--sky)", icon: <TrendingUp size={20} />, t: "Uwekezaji", en: "Investment", d: "Make money work, own your bike, and spot a pyramid scheme." },
            { key: "helmet" as const, fill: "var(--kanga)", icon: <ShieldCheck size={20} />, t: "Bima", en: "Insurance", d: "The covers that stop one crash from ending the business." },
          ].map((m) => (
            <Link key={m.t} href="/rider" className="group card-pop lift overflow-hidden flex flex-col reveal">
              <div className="relative aspect-[4/3] photo-zoom overflow-hidden border-b-2" style={{ borderColor: "var(--ink)" }}>
                <Photo name={m.key} sizes="(max-width: 640px) 90vw, 300px" />
                <div className="absolute top-3 left-3">
                  <IconBadge fill={m.fill} size={40} rotate={-6}>
                    {m.icon}
                  </IconBadge>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl">{m.t}</h3>
                  <span className="text-[0.78rem] font-semibold text-[var(--text-faint)]">{m.en}</span>
                </div>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[var(--text-muted)] flex-1">{m.d}</p>
                <span className="mt-3 text-[0.8rem] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: "var(--brand-strong)" }}>
                  3 lessons + quizzes <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── channels ── */}
      <section id="channels" className="relative overflow-hidden py-20" style={{ background: "var(--ink)", color: "var(--cream)" }}>
        <div className="absolute inset-x-0 top-0 stripe" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div className="relative reveal">
            <div className="relative aspect-[4/5] max-w-[420px] rounded-[28px] overflow-hidden border-[3px]" style={{ borderColor: "var(--matatu)" }}>
              <Photo name="phoneSmile" sizes="(max-width: 1024px) 90vw, 420px" />
            </div>
            <div
              className="absolute -right-2 sm:right-4 bottom-8 w-[240px] rounded-2xl p-3 border-2 animate-float"
              style={{ background: "#0c1a12", borderColor: "var(--mpesa)", ["--r" as string]: "3deg" }}
            >
              <div className="ussd-screen rounded-lg p-2.5 text-[0.72rem]">
                {`BodaPesa\n1. Jifunze kuhusu pesa\n2. Bidhaa za kifedha\n3. Akiba yangu`}
                <span className="ussd-caret" />
              </div>
            </div>
          </div>

          <div>
            <span className="eyebrow" style={{ color: "var(--matatu)" }}>
              <span className="w-6 h-[3px] rounded" style={{ background: "var(--matatu)" }} /> Every phone counts
            </span>
            <h2 className="mt-3 text-3xl sm:text-[2.6rem] leading-[1.08]" style={{ color: "var(--cream)" }}>
              Mulika mwizi or smartphone — nobody is left out.
            </h2>
            <p className="mt-4 leading-relaxed" style={{ color: "rgba(255,243,228,0.72)" }}>
              Each rider is reached on the channel they chose. The same lesson shrinks to one SMS screen for a feature phone and
              opens up into a full lesson with a quiz in the app.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {[
                { icon: <MessageSquareText size={20} />, fill: "var(--matatu)", t: "SMS", d: "Every handset. Replies like SOMO, NDIO and ACHA just work.", ch: "SMS" },
                { icon: <Hash size={20} />, fill: "var(--mpesa)", t: `USSD ${USSD_CODE}`, d: "No data, no smartphone, free to the rider.", ch: "USSD" },
                { icon: <MessageCircle size={20} />, fill: "var(--sunset)", t: "WhatsApp", d: "Rich messages for riders who live in their chats.", ch: "WHATSAPP" },
                { icon: <Smartphone size={20} />, fill: "var(--kanga)", t: "Rider app", d: "Lessons, quizzes, a savings jar and one-tap product requests.", ch: "APP" },
              ].map((c) => {
                const mode = providers.find((p) => p.channel === c.ch)?.mode ?? "simulated";
                return (
                  <div
                    key={c.t}
                    className="rounded-2xl p-4 border-2 lift reveal"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,243,228,0.14)" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <IconBadge fill={c.fill} size={38}>
                        {c.icon}
                      </IconBadge>
                      <ModePill mode={mode} />
                    </div>
                    <h3 className="mt-3 text-lg" style={{ color: "var(--cream)" }}>
                      {c.t}
                    </h3>
                    <p className="mt-1 text-[0.84rem] leading-relaxed" style={{ color: "rgba(255,243,228,0.7)" }}>
                      {c.d}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── partners ── */}
      <section id="partners" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="eyebrow" style={{ color: "var(--pink)" }}>
            <span className="w-6 h-[3px] rounded" style={{ background: "var(--kanga)" }} /> Partners
          </span>
          <h2 className="mt-3 text-3xl sm:text-[2.6rem] leading-[1.08]">Real institutions on the other end of the line</h2>
          <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
            Interest becomes a qualified lead in the partner&rsquo;s own pipeline — and each partner sees only its own riders.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {[
            {
              name: partners.find((p) => p.code === "STIMA")?.name ?? "Stima DT SACCO",
              n: partners.find((p) => p.code === "STIMA")?.n ?? 0,
              colour: "#0b6e4f",
              tag: "Savings · Credit · Investment",
              points: ["Daily-friendly deposit accounts", "Loans backed by your own savings", "Share capital that earns dividends"],
            },
            {
              name: partners.find((p) => p.code === "BRITAM")?.name ?? "Britam",
              n: partners.find((p) => p.code === "BRITAM")?.n ?? 0,
              colour: "#c8102e",
              tag: "Insurance · Pensions · Asset management",
              points: ["Personal accident & passenger cover", "Micro-pension from small contributions", "Unit trusts from a low minimum"],
            },
          ].map((p) => (
            <div key={p.name} className="card-pop p-6 relative overflow-hidden reveal lift">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-15" style={{ background: p.colour }} aria-hidden="true" />
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl grid place-items-center text-white font-display font-extrabold text-xl border-2" style={{ background: p.colour, borderColor: "var(--ink)" }}>
                  {p.name.charAt(0)}
                </span>
                <div>
                  <h3 className="text-2xl leading-tight">{p.name}</h3>
                  <div className="text-[0.78rem] font-semibold text-[var(--text-faint)]">{p.tag}</div>
                </div>
              </div>
              <ul className="mt-5 space-y-2">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2.5 text-[0.9rem]">
                    <span className="w-5 h-5 rounded-full grid place-items-center shrink-0" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t text-[0.82rem] font-bold" style={{ color: p.colour === "#c8102e" ? "var(--danger)" : "var(--success)" }}>
                <CountUp value={Number(p.n)} /> products in the catalogue
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────── photo CTA ── */}
      <section className="relative mx-4 sm:mx-6 mb-16 rounded-[32px] overflow-hidden border-[3px] reveal" style={{ borderColor: "var(--ink)" }}>
        <div className="absolute inset-0">
          <Photo name="matatus" sizes="100vw" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(26,18,11,0.92) 20%, rgba(26,18,11,0.55) 60%, rgba(255,90,31,0.35))" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
          <h2 className="text-4xl sm:text-6xl leading-[1.02] max-w-2xl" style={{ color: "var(--cream)" }}>
            Built for the stage, the street and the <span style={{ color: "var(--matatu)" }}>SACCO</span>.
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed" style={{ color: "rgba(255,243,228,0.8)" }}>
            Try the rider journey on your phone, dial the menu on the USSD simulator, or open the console the programme team and
            partners use every day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/rider" className="btn btn-primary btn-lg">
              Rider portal <ArrowRight size={18} />
            </Link>
            <Link href="/ussd" className="btn btn-accent btn-lg">
              <Hash size={17} /> USSD simulator
            </Link>
            <Link href="/admin" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.1)", color: "var(--cream)", borderColor: "rgba(255,243,228,0.4)" }}>
              Admin console
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── footer ── */}
      <footer style={{ background: "var(--ink)", color: "rgba(255,243,228,0.7)" }}>
        <div className="stripe" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div>
            <Logo tone="light" sub="Financial literacy for Nairobi's boda boda riders" />
            <p className="mt-4 text-[0.8rem] leading-relaxed max-w-sm">
              A final-year project in partnership with Stima DT SACCO and Britam. Product figures are indicative and must be
              confirmed with the institutions.
            </p>
          </div>
          <div>
            <div className="text-[0.7rem] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--matatu)" }}>
              Photography
            </div>
            <p className="text-[0.74rem] leading-relaxed">
              {credits.map((p, i) => (
                <span key={p.page}>
                  <a href={p.page} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {p.credit}
                  </a>
                  {i < credits.length - 1 ? " · " : ""}
                </span>
              ))}{" "}
              — via Unsplash, under the Unsplash License.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
