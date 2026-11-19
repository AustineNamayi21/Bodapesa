import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import ThemeToggle from "@/components/theme";
import { currentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { logoutAction } from "@/lib/actions";
import { Logo } from "@/components/brand";
import NavLinks from "./NavLinks";

export const dynamic = "force-dynamic";

/**
 * The console shell.
 *
 * Same language as the public site, at working density: black ground,
 * hairline rules instead of panels, 11px tracked capitals for every label.
 * The sidebar is separated from the content by a single rule rather than a
 * change of colour — on a data screen a second background tone reads as
 * clutter, and the rule is enough.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureSeeded();
  const user = await currentUser();
  if (!user) redirect("/login");

  const initials = user.name
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" data-theme-surface style={{ background: "var(--ground)" }}>
      <aside
        className="lg:w-[248px] lg:h-screen lg:sticky lg:top-0 flex flex-col shrink-0 lg:overflow-hidden"
        style={
          {
            background: "var(--ground)",
            borderRight: "1px solid var(--rule)",
            "--nav-fg": "var(--on-black-3)",
            "--nav-fg-strong": "var(--on-ground)",
          } as React.CSSProperties
        }
      >
        <div
          className="flex items-center justify-between gap-3 lg:block shrink-0"
          style={{ padding: "1.25rem", borderBottom: "1px solid var(--rule)" }}
        >
          <Logo tone="light" size={30} sub={user.partnerName ?? "Programme console"} />

          {/* Below lg the sidebar is a top strip and the account footer is out
              of reach, so the way out lives up here instead. */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="pill" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
              {user.partnerCode ?? "Admin"}
            </span>
            <ThemeToggle size={32} />
            <form action={logoutAction}>
              <button type="submit" className="btn btn-ghost btn-sm" style={{ whiteSpace: "nowrap" }}>
                <LogOut size={13} /> Sign out
              </button>
            </form>
          </div>
        </div>

        <NavLinks role={user.role} />

        <div className="mt-auto shrink-0 hidden lg:block" style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--rule)" }}>
          <div className="flex items-center gap-3">
            <span
              className="grid place-items-center shrink-0"
              style={{
                width: 36,
                height: 36,
                border: "1px solid var(--border-strong)",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="truncate"
                style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
              >
                {user.name}
              </div>
              <div className="truncate" style={{ fontSize: "0.6875rem", color: "var(--text-faint)", marginTop: "2px" }}>
                {user.partnerName ?? "Platform team"}
              </div>
            </div>
            <ThemeToggle size={32} />
          </div>

          <form action={logoutAction} style={{ marginTop: "0.9rem" }}>
            <button type="submit" className="btn btn-ghost btn-sm" style={{ width: "100%", whiteSpace: "nowrap" }}>
              <LogOut size={13} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <main
        className="flex-1 min-w-0"
        style={{ paddingInline: "clamp(20px, 3vw, 44px)", paddingBlock: "clamp(28px, 4vh, 48px)", maxWidth: "1560px" }}
      >
        {children}
      </main>
    </div>
  );
}
