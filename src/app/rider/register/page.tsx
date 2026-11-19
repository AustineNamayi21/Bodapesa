import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
  { sw: "Masomo bure, kwa lugha yako", en: "Free lessons, in your language" },
  { sw: "Lengo la akiba unalofuatilia", en: "A savings goal you can track" },
  { sw: "Bidhaa halisi za SACCO na bima", en: "Real SACCO and insurance products" },
];

export default async function RiderRegisterPage() {
  await ensureSeeded();
  if (await currentRiderId()) redirect("/rider/home");

  const stages = await all<StageOption>("SELECT id, name, subCounty FROM Stage ORDER BY subCounty, name");

  return (
    <main style={{ background: "var(--ground)", minHeight: "100vh" }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
      {/* ── photographic frame ─────────────────────────────────────────── */}
      <section className="frame-hero" style={{ minHeight: "clamp(320px, 40vh, 480px)" }}>
        <div className="frame-media animate-kenburns">
          <Photo name="kenyanPlate" priority sizes="(max-width: 1024px) 100vw, 48vw" />
        </div>
        <div className="scrim" />
        <div style={{ position: "absolute", top: "var(--gutter)", left: "var(--gutter)", zIndex: 1 }}>
          <Logo tone="light" size={30} />
        </div>
        <div style={{ width: "100%", paddingInline: "var(--gutter)", paddingTop: "calc(var(--gutter) + 4.5rem)", paddingBottom: "clamp(32px, 5vh, 56px)" }}>
          <p className="eyebrow eyebrow-rule animate-rise" style={{ color: "#fff" }}>
            Jisajili · Register
          </p>
          <h1 className="display-xl animate-rise d-1" style={{ marginTop: "1.25rem", color: "#fff", maxWidth: "9ch" }}>
            Anza leo
          </h1>
          <ul className="animate-rise d-2" style={{ marginTop: "1.75rem", listStyle: "none", padding: 0, maxWidth: "26rem" }}>
            {PROMISES.map((p) => (
              <li key={p.sw} style={{ padding: "0.85rem 0", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                <span style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: "#fff" }}>{p.sw}</span>
                <span style={{ display: "block", fontSize: "0.78rem", marginTop: "0.2rem", color: "rgba(255,255,255,0.55)" }}>
                  {p.en}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── the form ───────────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--ground)",
          borderLeft: "1px solid var(--rule)",
          paddingInline: "var(--gutter)",
          paddingBlock: "clamp(40px, 6vh, 72px)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "30rem", marginInline: "auto" }}>
          <Link href="/rider" className="cta" style={{ fontSize: "0.6875rem", color: "var(--text-faint)", marginBottom: "2rem" }}>
            <ArrowLeft size={13} />
            <span>Ingia badala yake · Sign in instead</span>
          </Link>

          <RegisterForm stages={stages} />

          <p className="copy-sm" style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--rule)" }}>
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
