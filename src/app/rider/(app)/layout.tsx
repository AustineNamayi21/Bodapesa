import { requireRider } from "@/lib/rider";
import { ensureSeeded } from "@/lib/seed";
import { riderLogoutAction, setRiderLanguageAction } from "@/lib/actions";
import RiderNav from "./RiderNav";

export const dynamic = "force-dynamic";

export default async function RiderAppLayout({ children }: { children: React.ReactNode }) {
  await ensureSeeded();
  const { rider, unread } = await requireRider();

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto border-x" style={{ background: "var(--surface)" }}>
      <header className="sticky top-0 z-20 px-4 py-3 border-b flex items-center justify-between gap-2" style={{ background: "var(--surface)" }}>
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-lg grid place-items-center text-xs font-bold shrink-0"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            B
          </div>
          <div className="min-w-0">
            <div className="text-[0.82rem] font-semibold truncate leading-tight">{rider.firstName}</div>
            <div className="text-[0.68rem] text-[var(--text-faint)] leading-tight">
              Score {rider.literacyScore}/100
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <form action={setRiderLanguageAction} className="flex gap-1">
            <input type="hidden" name="riderId" value={rider.id} />
            {(["SW", "EN", "SH"] as const).map((l) => (
              <button
                key={l}
                name="language"
                value={l}
                className="pill"
                style={{
                  background: rider.language === l ? "var(--brand-soft)" : "var(--surface-2)",
                  color: rider.language === l ? "var(--brand-strong)" : "var(--text-faint)",
                }}
              >
                {l}
              </button>
            ))}
          </form>
          <form action={riderLogoutAction}>
            <button className="text-[0.7rem] text-[var(--text-faint)] px-1 hover:underline">Toka</button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24">{children}</main>

      <RiderNav lang={rider.language} unread={unread} />
    </div>
  );
}
