import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, PiggyBank, ShieldCheck } from "lucide-react";
import { all } from "@/lib/db";
import { currentRiderId } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { Logo, Photo } from "@/components/brand";
import RegisterForm, { type StageOption } from "./RegisterForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jisajili · Register — BodaPesa",
  description:
    "Register yourself on BodaPesa and start free financial literacy lessons in Kiswahili, English or Sheng.",
};

const PROMISES = [
  {
    icon: BookOpen,
    sw: "Masomo bure, kwa lugha yako",
    en: "Free lessons, in your language",
  },
  {
    icon: PiggyBank,
    sw: "Lengo la akiba unalofuatilia",
    en: "A savings goal you can track",
  },
  {
    icon: ShieldCheck,
    sw: "Bidhaa halisi za SACCO na bima",
    en: "Real SACCO and insurance products",
  },
];

export default async function RiderRegisterPage() {
  await ensureSeeded();
  // Already signed in — no reason to register again.
  if (await currentRiderId()) redirect("/rider/home");

  const stages = await all<StageOption>("SELECT id, name, subCounty FROM Stage ORDER BY subCounty, name");

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* ── editorial side ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <div className="absolute inset-0 animate-kenburns">
          <Photo name="kenyanPlate" priority sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.22) 26%, rgba(0,0,0,0.66) 56%, rgba(0,0,0,0.90) 100%)",
          }}
        />
        <div className="relative flex flex-col justify-between p-5 sm:p-10 min-h-[32vh] lg:min-h-screen">
          <Logo tone="light" />

          <div className="py-8 lg:py-0 animate-rise">
            <span
              className="pill"
              style={{ background: "var(--ember)", color: "#000", borderColor: "transparent" }}
            >
              Jisajili · Register
            </span>
            <h1
              className="mt-4 text-[2.4rem] sm:text-[3.4rem] leading-[0.98] max-w-md"
              style={{ color: "#fff" }}
            >
              Anza leo.
            </h1>
            <p
              className="mt-4 text-[1rem] sm:text-[1.1rem] max-w-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.76)", fontFamily: "var(--font-editorial)" }}
            >
              Dakika mbili za kujiandikisha. Kisha somo lako la kwanza.
              <span className="block mt-2 opacity-70">Two minutes to register. Then your first lesson.</span>
            </p>

            <ul className="mt-8 space-y-0 max-w-sm">
              {PROMISES.map(({ icon: Icon, sw, en }) => (
                <li
                  key={sw}
                  className="flex items-start gap-3 py-3.5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}
                >
                  <Icon
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 mt-0.5"
                    style={{ color: "var(--ember)" }}
                  />
                  <span className="text-[0.88rem] leading-snug" style={{ color: "#fff" }}>
                    {sw}
                    <span className="block text-[0.78rem] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {en}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="hidden lg:block text-[0.68rem]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Stima DT SACCO · Britam
          </p>
        </div>
      </section>

      {/* ── form side ────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-14 py-9 lg:py-14 flex items-start justify-center">
        <div className="w-full max-w-md">
          <Link
            href="/rider"
            className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase mb-7"
            style={{ letterSpacing: "0.16em", fontFamily: "var(--font-display)", color: "var(--text-faint)" }}
          >
            <ArrowLeft size={13} /> Ingia badala yake · Sign in instead
          </Link>

          <RegisterForm stages={stages} />

          <p
            className="mt-8 pt-5 text-[0.74rem] leading-relaxed"
            style={{ borderTop: "1px solid var(--border)", color: "var(--text-faint)" }}
          >
            Tayari umesajiliwa?{" "}
            <Link href="/rider" className="underline-wipe" style={{ color: "var(--text)" }}>
              Ingia hapa
            </Link>
            . Already registered? Sign in with your phone number.
          </p>
        </div>
      </section>
    </main>
  );
}
