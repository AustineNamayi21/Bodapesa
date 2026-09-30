import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { logoutAction } from "@/lib/actions";
import { Logo } from "@/components/brand";
import NavLinks from "./NavLinks";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* sidebar */}
      <aside
        className="lg:w-64 lg:h-screen lg:sticky lg:top-0 flex flex-col relative"
        style={
          {
            background: "var(--ink)",
            color: "var(--cream)",
            "--nav-fg": "rgba(255,243,228,0.66)",
            "--nav-fg-strong": "var(--cream)",
            "--nav-hover": "rgba(255,243,228,0.08)",
          } as React.CSSProperties
        }
      >
        <div className="p-5 flex items-center justify-between lg:block">
          <Logo tone="light" size={34} sub={user.partnerName ?? "Programme console"} />
          <span className="pill lg:hidden" style={{ background: "var(--sunset)", color: "var(--ink)" }}>
            {user.partnerCode ?? "Admin"}
          </span>
        </div>

        <NavLinks role={user.role} />

        <div className="mt-auto p-3 hidden lg:block">
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "rgba(255,243,228,0.06)" }}>
            <span
              className="w-10 h-10 rounded-xl grid place-items-center font-display font-extrabold text-sm shrink-0 border-2"
              style={{ background: "var(--matatu)", color: "var(--ink)", borderColor: "var(--ink)" }}
            >
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[0.8rem] font-bold truncate">{user.name}</div>
              <div className="text-[0.68rem] truncate" style={{ color: "rgba(255,243,228,0.55)" }}>
                {user.partnerName ?? "Platform team"}
              </div>
            </div>
            <form action={logoutAction}>
              <button
                className="w-8 h-8 rounded-lg grid place-items-center transition-colors hover:bg-white/10"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1.5 hidden lg:block stripe" style={{ height: "auto", background: "repeating-linear-gradient(180deg, var(--sunset) 0 40px, var(--matatu) 40px 80px, var(--mpesa) 80px 120px, var(--kanga) 120px 160px, var(--sky) 160px 200px)" }} aria-hidden="true" />
      </aside>

      <main className="flex-1 min-w-0 px-4 sm:px-8 py-7 max-w-[1440px]">{children}</main>
    </div>
  );
}
