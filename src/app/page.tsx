import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Hash,
  HeartHandshake,
  Landmark,
  MessageCircle,
  MessageSquareText,
  PiggyBank,
  Smartphone,
  TrendingUp,
  Umbrella,
  Users,
} from "lucide-react";
import { ensureSeeded } from "@/lib/seed";
import { kpis } from "@/lib/analytics";
import { providerStatus } from "@/lib/channels/providers";
import { all, count } from "@/lib/db";
import { USSD_CODE } from "@/lib/ussd-code";
import { PHOTOS, type PhotoKey } from "@/lib/photos";
import { ModePill } from "@/components/ui";
import { IconBadge, Logo, Photo } from "@/components/brand";
import { CountUp } from "@/components/motion";
import { CardRail, HeroCarousel, SiteHeader, type Slide } from "@/components/site";

export const dynamic = "force-dynamic";

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
  const partner = (code: string) => partners.find((p) => p.code === code);

  const slides: Slide[] = [
    {
      photo: "heroRider",
      eyebrow: "Kwa wanabodaboda wa Nairobi",
      title: (
        <>
          Every shilling you ride for, <span className="highlight">working</span> for you.
        </>
      ),
      body: "Free, bite-sized money lessons in Kiswahili, English and Sheng — on any phone. Then a direct line to real savings, loans and insurance from Stima DT SACCO and Britam.",
      primary: { href: "/rider", label: "Start learning — it's free" },
      secondary: { href: "/ussd", label: `Dial ${USSD_CODE}` },
      card: { label: "Leo umeweka", value: "KSh 100 saved" },
    },
    {
      photo: "helmet",
      eyebrow: "Bima · Insurance",
      title: (
        <>
          Cover your passenger. <span className="highlight">Cover yourself.</span>
        </>
      ),
      body: "Most riders carry only the third-party cover the law requires. Learn what personal accident and passenger cover really cost — from a few shillings a day.",
      primary: { href: "/rider/products", label: "See insurance products" },
      secondary: { href: "/rider/learn", label: "Read the lesson" },
      card: { label: "Bima", value: "Passenger covered" },
    },
    {
      photo: "market",
      eyebrow: "Akiba · Savings",
      title: (
        <>
          Save at the stage. <span className="highlight">Grow</span> with your SACCO.
        </>
      ),
      body: "KSh 100 a day is KSh 36,000 a year. Set a goal, watch your savings jar fill, and turn deposits into SACCO shares and loan collateral.",
      primary: { href: "/rider/goal", label: "Open my savings jar" },
      secondary: { href: "/rider/learn", label: "How saving works" },
      card: { label: "Lengo", value: "64% to SACCO shares" },
    },
  ];

  const learnCards: { photo: PhotoKey; tag: string; title: string; body: string; href: string; cta: string }[] = [
    { photo: "market", tag: "Akiba · Savings", title: "Save first, not last", body: "Small daily amounts that turn into SACCO shares.", href: "/rider/learn", cta: "Start lesson" },
    { photo: "vendor", tag: "Mikopo · Credit", title: "What 1% a day really costs", body: "Tell a loan that builds from one that eats.", href: "/rider/learn", cta: "Start lesson" },
    { photo: "skyline", tag: "Uwekezaji · Investment", title: "Make your money work", body: "Own your bike, grow your shares, spot a scam.", href: "/rider/learn", cta: "Start lesson" },
    { photo: "helmet", tag: "Bima · Insurance", title: "One crash shouldn't end the business", body: "Personal accident and passenger cover, explained.", href: "/rider/learn", cta: "Start lesson" },
    { photo: "countryRoad", tag: "Savings goal", title: "Your savings jar", body: "Pick a goal, record deposits, watch it fill.", href: "/rider/goal", cta: "Set a goal" },
    { photo: "stage", tag: "Products", title: "Real offers, one tap away", body: "Request a call-back from Stima SACCO or Britam.", href: "/rider/products", cta: "Browse products" },
  ];

  return (
    <main className="min-h-screen overflow-x-clip">
      <SiteHeader />
      <HeroCarousel slides={slides} />

      {/* ─────────────────────────────────────────────────── numbers ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-2 pb-6">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {[
            { label: "Riders registered", value: k.riders },
            { label: "Messages sent", value: k.messagesSent },
            { label: "Stages reached", value: stages },
            { label: "Partner products", value: products },
          ].map((s) => (
            <div key={s.label} className="card p-5 lift">
              <dd className="font-display font-bold text-4xl tracking-tight" style={{ color: "var(--brand)" }}>
                <CountUp value={s.value} />
              </dd>
              <dt className="mt-1 text-[0.86rem] font-medium text-[var(--text-muted)]">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ────────────────────────────────────────────── learn (rail) ── */}
      <section id="learn" className="py-20 scroll-mt-20" style={{ background: "var(--surface-2)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl reveal">
            <h2 className="text-3xl sm:text-[2.7rem] leading-[1.1]">Whatever you ride for, there&rsquo;s a lesson for it</h2>
            <p className="mt-3 text-[var(--text-muted)] leading-relaxed">
              {lessons} short lessons with quizzes across savings, credit, investment and insurance — each one small enough for a
              single SMS.
            </p>
          </div>

          <div className="mt-10">
            <CardRail label="Lessons and tools">
              {learnCards.map((c) => (
                <Link
                  key={c.title}
                  href={c.href}
                  className="group relative shrink-0 snap-start w-[82%] sm:w-[340px] h-[420px] rounded-[22px] overflow-hidden"
                  style={{ boxShadow: "var(--shadow)" }}
                >
                  <div className="absolute inset-0 photo-zoom">
                    <Photo name={c.photo} sizes="340px" />
                  </div>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.88) 100%)" }} />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="text-[0.72rem] font-semibold uppercase tracking-wider" style={{ color: "var(--green-bright)" }}>
                      {c.tag}
                    </span>
                    <h3 className="mt-1.5 text-2xl leading-tight text-white">{c.title}</h3>
                    <p className="mt-1.5 text-[0.88rem] text-white/75">{c.body}</p>
                    <span className="mt-4 btn btn-primary btn-sm">
                      {c.cta} <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </CardRail>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────── how it works ── */}
      <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 py-24 scroll-mt-20">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center">
          <div className="relative reveal">
            <div className="relative aspect-[4/5] rounded-[28px] overflow-hidden photo-zoom" style={{ boxShadow: "var(--shadow-lg)" }}>
              <Photo name="kenyanPlate" sizes="(max-width: 1024px) 92vw, 520px" />
            </div>
            <div className="absolute -bottom-6 -right-2 sm:-right-6 rounded-2xl p-4 max-w-[260px]" style={{ background: "var(--ink)", color: "#fff", boxShadow: "var(--shadow-lg)" }}>
              <div className="text-[0.7rem] font-semibold uppercase tracking-wider" style={{ color: "var(--green-bright)" }}>
                The problem
              </div>
              <p className="mt-1 text-[0.86rem] leading-snug text-white/85">
                Income arrives daily, not monthly — and fits none of the products banks are built around.
              </p>
            </div>
          </div>

          <div>
            <span className="eyebrow" style={{ color: "var(--brand-strong)" }}>
              <span className="w-7 h-[2px] rounded" style={{ background: "var(--green)" }} /> How it works
            </span>
            <h2 className="mt-3 text-3xl sm:text-[2.7rem] leading-[1.1]">From the stage to the SACCO in four steps</h2>

            <ol className="mt-10 relative">
              <span className="absolute left-[21px] top-3 bottom-3 w-[2px]" style={{ background: "var(--border)" }} aria-hidden="true" />
              {[
                { icon: <Users size={20} />, t: "Register & consent", d: "At the stage with a field officer, by dialling the USSD code, or by texting JIUNGE. Nothing is sent without a clear yes." },
                { icon: <BookOpen size={20} />, t: "Learn", d: "Short lessons and quizzes in the rider's own language, on the channel they prefer." },
                { icon: <MessageSquareText size={20} />, t: "Be reached", d: "Campaigns target the gaps each rider actually has — uninsured, no SACCO, no savings goal." },
                { icon: <HeartHandshake size={20} />, t: "Be onboarded", d: "One tap on “Ninavutiwa” and an officer from Stima SACCO or Britam calls back." },
              ].map((s, i) => (
                <li key={s.t} className="relative flex gap-5 pb-8 last:pb-0 reveal">
                  <span className="relative z-10 w-11 h-11 rounded-full grid place-items-center shrink-0 text-white font-display font-bold" style={{ background: "var(--green)" }}>
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-xl flex items-center gap-2">
                      <span style={{ color: "var(--brand-strong)" }}>{s.icon}</span> {s.t}
                    </h3>
                    <p className="mt-1.5 text-[0.92rem] leading-relaxed text-[var(--text-muted)] max-w-md">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────── the problem ── */}
      <section className="py-20" style={{ background: "var(--surface-2)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-[2.7rem] leading-[1.1] max-w-2xl reveal">Riders move Nairobi. The financial system barely sees them.</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <PiggyBank size={22} />, t: "No cushion", d: "A puncture or a fine is met with a 1%-a-day mobile loan, not savings." },
              { icon: <Umbrella size={22} />, t: "No cover", d: "Third-party only — the passenger and the rider himself are unprotected." },
              { icon: <Landmark size={22} />, t: "No record", d: "Years of reliable earnings, and no credit history to show for them." },
              { icon: <TrendingUp size={22} />, t: "No pension", d: "Riding has a short physical window. Nobody is building the after." },
            ].map((p) => (
              <div key={p.t} className="card p-6 lift reveal">
                <IconBadge size={48}>{p.icon}</IconBadge>
                <h3 className="mt-5 text-xl">{p.t}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--text-muted)]">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────── products ── */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-24 scroll-mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4 reveal">
          <div>
            <h2 className="text-4xl sm:text-5xl leading-none">
              Our products<span className="count-sup">({products})</span>
            </h2>
            <Link href="/rider/products" className="sticker mt-4">
              Discover all products
            </Link>
          </div>
          <Link href="/rider/products" className="w-12 h-12 rounded-full grid place-items-center border hover:border-[var(--green)] hover:text-[var(--green)] transition-colors" aria-label="All products">
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {[
            {
              code: "STIMA",
              name: partner("STIMA")?.name ?? "Stima DT SACCO",
              n: Number(partner("STIMA")?.n ?? 0),
              photo: "vendor" as PhotoKey,
              tag: "Savings · Credit · Investment",
              points: ["Daily-friendly deposit accounts", "Loans backed by your own savings", "Share capital that earns dividends"],
            },
            {
              code: "BRITAM",
              name: partner("BRITAM")?.name ?? "Britam",
              n: Number(partner("BRITAM")?.n ?? 0),
              photo: "helmet" as PhotoKey,
              tag: "Insurance · Pensions · Asset management",
              points: ["Personal accident & passenger cover", "Micro-pension from small contributions", "Unit trusts from a low minimum"],
            },
          ].map((p) => (
            <Link key={p.code} href="/rider/products" className="group rounded-[22px] overflow-hidden flex flex-col reveal" style={{ background: "var(--ink)", color: "#fff", boxShadow: "var(--shadow-lg)" }}>
              <div className="relative h-56 overflow-hidden photo-zoom">
                <Photo name={p.photo} sizes="(max-width: 768px) 92vw, 620px" />
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <div className="text-[0.74rem] font-semibold uppercase tracking-wider" style={{ color: "var(--green-bright)" }}>
                  {p.tag}
                </div>
                <h3 className="mt-1.5 text-3xl text-white">{p.name}</h3>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-3 text-[0.95rem] text-white/85">
                      <span className="w-5 h-5 rounded-full grid place-items-center shrink-0" style={{ background: "var(--green)" }}>
                        <Check size={12} strokeWidth={3} color="#fff" />
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[0.86rem] text-white/60">
                    <CountUp value={p.n} /> products
                  </span>
                  <span className="btn btn-primary btn-sm">
                    Learn more <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────── channels ── */}
      <section id="channels" className="py-24 scroll-mt-20" style={{ background: "var(--surface-2)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <span className="eyebrow" style={{ color: "var(--brand-strong)" }}>
              <span className="w-7 h-[2px] rounded" style={{ background: "var(--green)" }} /> Every phone counts
            </span>
            <h2 className="mt-3 text-3xl sm:text-[2.7rem] leading-[1.1]">Mulika mwizi or smartphone — nobody is left out</h2>
            <p className="mt-4 text-[var(--text-muted)] leading-relaxed max-w-xl">
              Each rider is reached on the channel they chose. The same lesson shrinks to one SMS screen for a feature phone and
              opens into a full lesson with a quiz in the app.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {[
                { icon: <MessageSquareText size={20} />, t: "SMS", d: "Every handset. Replies like SOMO, NDIO and ACHA just work.", ch: "SMS" },
                { icon: <Hash size={20} />, t: `USSD ${USSD_CODE}`, d: "No data, no smartphone, free to the rider.", ch: "USSD" },
                { icon: <MessageCircle size={20} />, t: "WhatsApp", d: "Rich messages for riders who live in their chats.", ch: "WHATSAPP" },
                { icon: <Smartphone size={20} />, t: "Rider app", d: "Lessons, quizzes, a savings jar and one-tap requests.", ch: "APP" },
              ].map((c) => (
                <div key={c.t} className="card p-5 lift reveal">
                  <div className="flex items-center justify-between gap-2">
                    <IconBadge size={42}>{c.icon}</IconBadge>
                    <ModePill mode={providers.find((p) => p.channel === c.ch)?.mode ?? "simulated"} />
                  </div>
                  <h3 className="mt-4 text-lg">{c.t}</h3>
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-[var(--text-muted)]">{c.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative reveal">
            <div className="relative aspect-[4/5] rounded-[28px] overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
              <Photo name="phoneSmile" sizes="(max-width: 1024px) 92vw, 480px" />
            </div>
            <div className="absolute -left-2 sm:-left-8 bottom-10 w-[240px] rounded-2xl p-3 animate-float" style={{ background: "#0a170e", boxShadow: "var(--shadow-lg)" }}>
              <div className="ussd-screen rounded-lg p-3 text-[0.74rem]">
                {`BodaPesa\n1. Jifunze kuhusu pesa\n2. Bidhaa za kifedha\n3. Akiba yangu`}
                <span className="ussd-caret" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────── help band ── */}
      <section style={{ background: "var(--ink)", color: "#fff" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl sm:text-4xl leading-tight max-w-xl text-white">
            Can&rsquo;t find what you&rsquo;re looking for, or need some help?
          </h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-8">
            {[
              { icon: <Hash size={20} />, t: "Dial the menu", v: USSD_CODE, href: "/ussd" },
              { icon: <MessageSquareText size={20} />, t: "Text to join", v: "SMS “JIUNGE”", href: "/ussd" },
              { icon: <Smartphone size={20} />, t: "Use the app", v: "Rider portal", href: "/rider" },
            ].map((h) => (
              <Link key={h.t} href={h.href} className="group flex items-start gap-4">
                <span className="w-11 h-11 rounded-full grid place-items-center shrink-0 border transition-colors group-hover:bg-[var(--green)]" style={{ borderColor: "var(--green-bright)", color: "var(--green-bright)" }}>
                  {h.icon}
                </span>
                <span>
                  <span className="block text-[0.85rem] text-white/60">{h.t}</span>
                  <span className="block mt-0.5 font-display text-xl font-semibold text-white underline decoration-[var(--green-bright)] decoration-2 underline-offset-[6px]">
                    {h.v}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────── footer ── */}
      <footer style={{ background: "var(--bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 text-[0.86rem] leading-relaxed text-[var(--text-muted)] max-w-xs">
              Financial literacy and formal financial access for Nairobi&rsquo;s boda boda riders — a final-year project with Stima DT
              SACCO and Britam.
            </p>
          </div>
          {[
            { h: "Riders", links: [["Rider portal", "/rider"], ["Lessons", "/rider/learn"], ["Savings goal", "/rider/goal"], ["USSD simulator", "/ussd"]] },
            { h: "Programme", links: [["How it works", "/#how"], ["Products", "/#products"], ["Channels", "/#channels"], ["Console sign-in", "/login"]] },
            { h: "Partners", links: [["Stima DT SACCO", "/rider/products"], ["Britam", "/rider/products"]] },
          ].map((col) => (
            <div key={col.h}>
              <div className="font-display font-semibold text-[1rem]">{col.h}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-[0.9rem] text-[var(--text-muted)] hover:text-[var(--brand-strong)] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-3 md:items-center justify-between text-[0.78rem] text-[var(--text-faint)]">
            <span>© {new Date().getFullYear()} BodaPesa. Product figures are indicative and must be confirmed with the institutions.</span>
            <span>
              Photos via Unsplash:{" "}
              {credits.map((p, i) => (
                <span key={p.page}>
                  <a href={p.page} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {p.credit}
                  </a>
                  {i < credits.length - 1 ? ", " : ""}
                </span>
              ))}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
