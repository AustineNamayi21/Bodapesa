import { redirect } from "next/navigation";

import { currentUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { listConsoleUsers } from "@/lib/users";
import { CONSOLE_ROLES } from "@/lib/console-users";
import { PageHeader } from "@/components/admin";
import { Pill } from "@/components/ui";
import { NewConsoleUserForm, ConsoleUserRow } from "./UserForms";

export const dynamic = "force-dynamic";

/**
 * Who can get into the console.
 *
 * The seed creates one platform account and nothing else, so without this
 * page a partner's staff had no way in — and the conversations they are
 * meant to answer were unreachable to them in production.
 */
export default async function ConsoleUsersPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "PLATFORM_ADMIN") {
    return (
      <div>
        <PageHeader
          title="Console accounts"
          subtitle="Only the platform team manages who can sign in."
        />
        <p style={{ color: "var(--text-faint)", fontSize: "0.88rem" }}>
          Ask the BodaPesa platform team to add or change an account for your organisation.
        </p>
      </div>
    );
  }

  const users = await listConsoleUsers();
  const partners = await all<{ id: string; name: string }>("SELECT id, name FROM Partner ORDER BY name");
  const activePartnerStaff = users.filter((u) => u.role === "PARTNER_ADMIN" && Number(u.active) === 1);
  const withoutStaff = partners.filter((p) => !activePartnerStaff.some((u) => u.partnerId === p.id));

  return (
    <div>
      <PageHeader
        title="Console accounts"
        subtitle={`${users.filter((u) => Number(u.active) === 1).length} active. Partner staff see only their own pipeline and their own conversations.`}
      />

      {withoutStaff.length ? (
        <div
          style={{
            borderLeft: "2px solid var(--accent)",
            padding: "0.9rem 1.1rem",
            marginBottom: "2rem",
            background: "var(--surface-2)",
          }}
        >
          <p style={{ fontSize: "0.86rem", lineHeight: 1.6 }}>
            <strong>{withoutStaff.map((p) => p.name).join(" and ")}</strong>{" "}
            {withoutStaff.length === 1 ? "has" : "have"} no one who can sign in, so riders asking about{" "}
            {withoutStaff.length === 1 ? "their" : "those"} products have nobody to answer them.
          </p>
        </div>
      ) : null}

      <NewConsoleUserForm partners={partners} roles={CONSOLE_ROLES.map((r) => ({ ...r }))} />

      <div style={{ marginTop: "3rem" }}>
        <p className="stat-label" style={{ marginBottom: "1rem" }}>
          Accounts
        </p>
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {users.map((u) => (
            <ConsoleUserRow key={u.id} user={u} isSelf={u.id === user.id} />
          ))}
        </div>
      </div>

      <p className="stat-label" style={{ marginTop: "2rem", maxWidth: "60ch", lineHeight: 1.7 }}>
        Switching an account off keeps its history — the threads it answered and the leads it owns stay
        attached to it — but stops it signing in. The last active platform account cannot be switched off.
      </p>

      <ToneLegend />
    </div>
  );
}

function ToneLegend() {
  return (
    <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {CONSOLE_ROLES.map((r) => (
        <span key={r.value} className="stat-label">
          <Pill tone="neutral">{r.label}</Pill> {r.hint}
        </span>
      ))}
    </div>
  );
}
