import { LogOut } from "lucide-react";
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
    <div className="min-h-screen" style={{ background: "var(--surface-2)" }}>
      <div className="min-h-screen flex flex-col max-w-md mx-auto relative sm:border-x-2" style={{ background: "var(--bg)", borderColor: "var(--ink)" }}>
        <header className="sticky top-0 z-30" style={{ background: "var(--ink)", color: "var(--cream)" }}>
          <div className="px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <LogoMark size={34} className="shrink-0" />
              <div className="min-w-0">
                <div className="text-[0.9rem] font-display font-bold truncate leading-tight">{rider.firstName}</div>
                <div className="text-[0.68rem] leading-tight flex items-center gap-1" style={{ color: "var(--matatu)" }}>
                  ★ {rider.literacyScore}/100
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <form action={setRiderLanguageAction} className="flex rounded-full p-0.5" style={{ background: "rgba(255,243,228,0.12)" }}>
                <input type="hidden" name="riderId" value={rider.id} />
                {(["SW", "EN", "SH"] as const).map((l) => (
                  <button
                    key={l}
                    name="language"
                    value={l}
                    className="px-2.5 py-1 rounded-full text-[0.7rem] font-extrabold transition-colors"
                    style={{
                      background: rider.language === l ? "var(--matatu)" : "transparent",
                      color: rider.language === l ? "var(--ink)" : "rgba(255,243,228,0.7)",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </form>
              <form action={riderLogoutAction}>
                <button
                  className="w-8 h-8 rounded-full grid place-items-center transition-colors hover:bg-white/10"
                  aria-label="Toka · Sign out"
                  title="Toka · Sign out"
                >
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </div>
          <div className="stripe stripe-animated" />
        </header>

        <main className="flex-1 px-4 py-5 pb-28">{children}</main>

        <RiderNav lang={rider.language} unread={unread} />
      </div>
    </div>
  );
}
