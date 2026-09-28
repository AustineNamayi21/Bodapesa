import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { logoutAction } from "@/lib/actions";
import NavLinks from "./NavLinks";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureSeeded();
  const user = await currentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* sidebar */}
      <aside
        className="lg:w-60 lg:min-h-screen lg:sticky lg:top-0 border-b lg:border-b-0 lg:border-r flex flex-col"
        style={{ background: "var(--surface)" }}
      >
        <div className="p-4 flex items-center justify-between lg:block">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg grid place-items-center text-xs font-bold"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              B
            </div>
            <span className="font-semibold tracking-tight text-sm">BodaPesa</span>
          </Link>
          <span className="pill lg:hidden" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
            {user.partnerCode ?? "Admin"}
          </span>
        </div>

        <NavLinks role={user.role} />

        <div className="mt-auto p-3 border-t hidden lg:block">
          <div className="text-[0.78rem] font-medium truncate">{user.name}</div>
          <div className="text-[0.7rem] text-[var(--text-faint)] truncate mb-2">
            {user.partnerName ?? "Platform team"}
          </div>
          <form action={logoutAction}>
            <button className="btn btn-ghost btn-sm w-full">Sign out</button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 max-w-[1400px]">{children}</main>
    </div>
  );
}
