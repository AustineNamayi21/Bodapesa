import { LogOut } from "lucide-react";
import ThemeToggle from "@/components/theme";
import { requireRider } from "@/lib/rider";
import { ensureSeeded } from "@/lib/seed";
import { riderLogoutAction, setRiderLanguageAction } from "@/lib/actions";
import { LogoMark } from "@/components/brand";
import RiderNav from "./RiderNav";

export const dynamic = "force-dynamic";

export default async function RiderAppLayout({ children }: { children: React.ReactNode }) {
  await ensureSeeded();
  const { rider, unread } = await requireRider();

  return (
    <div className="min-h-screen" data-theme-surface style={{ background: "var(--ground)" }}>
      <div
        className="min-h-screen flex flex-col max-w-md mx-auto relative"
        style={{ background: "var(--ground)", borderInline: "1px solid var(--rule)" }}
      >
        {/* The bar is a thin rule of information, not a coloured band: the
            content below it should be the first thing the eye lands on. */}
        <header
          className="sticky top-0 z-30"
          data-theme-surface
          style={{ background: "var(--ground)", borderBottom: "1px solid var(--rule)" }}
        >
          <div className="px-4 flex items-center justify-between gap-3" style={{ minHeight: "56px" }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <LogoMark size={26} className="shrink-0" />
              <div className="min-w-0">
                <div
                  className="truncate"
                  style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}
                >
                  {rider.firstName}
                </div>
                <div
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--accent)",
                    fontVariantNumeric: "tabular-nums",
                    marginTop: "1px",
                  }}
                >
                  {rider.literacyScore}/100
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle size={32} />
              <form action={setRiderLanguageAction} className="flex" style={{ border: "1px solid var(--rule)" }}>
                <input type="hidden" name="riderId" value={rider.id} />
                {(["SW", "EN", "SH"] as const).map((l, i) => (
                  <button
                    key={l}
                    name="language"
                    value={l}
                    style={{
                      minWidth: "34px",
                      minHeight: "32px",
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      borderLeft: i === 0 ? "none" : "1px solid var(--rule)",
                      background: rider.language === l ? "var(--on-ground)" : "transparent",
                      color: rider.language === l ? "var(--ground)" : "var(--text-faint)",
                      transition: "background 0.35s var(--ease), color 0.35s var(--ease)",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </form>
              <form action={riderLogoutAction}>
                <button
                  className="grid place-items-center"
                  style={{ width: 36, height: 36, color: "var(--text-faint)", background: "transparent", border: 0 }}
                  aria-label="Toka · Sign out"
                  title="Toka · Sign out"
                >
                  <LogOut size={15} />
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1" style={{ paddingBottom: "6.5rem" }}>
          {children}
        </main>

        <RiderNav lang={rider.language} unread={unread} />
      </div>
    </div>
  );
}
