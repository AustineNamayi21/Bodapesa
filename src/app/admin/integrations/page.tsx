import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { providerStatus } from "@/lib/channels/providers";
import { databaseKind } from "@/lib/db";
import { Card, ModePill, Pill, SectionTitle, STATUS_TONE, timeAgo } from "@/components/ui";
import { displayMsisdn } from "@/lib/i18n";
import TestSend from "./TestSend";
import CopyField from "./CopyField";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const user = await currentUser();
  if (user?.role !== "PLATFORM_ADMIN") redirect("/admin");

  // Build callback URLs from the address this page was actually reached on,
  // so what is shown is exactly what the providers need to call.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = env.publicUrl || `${proto}://${host}`;
  const secret = env.webhookSecret ? `?secret=${encodeURIComponent(env.webhookSecret)}` : "";
  const isLocal = /localhost|127\.0\.0\.1|192\.168\./.test(base);

  const providers = providerStatus();
  const dbKind = await databaseKind();

  const recentTests = await all<{
    id: string;
    channel: string;
    status: string;
    error: string | null;
    providerRef: string | null;
    createdAt: string;
    deliveredAt: string | null;
    msisdn: string;
  }>(
    `SELECT m.id, m.channel, m.status, m.error, m.providerRef, m.createdAt, m.deliveredAt, r.msisdn
       FROM Message m JOIN Rider r ON r.id = m.riderId
      WHERE m.campaignId IS NULL AND m.direction = 'OUT'
      ORDER BY m.createdAt DESC LIMIT 8`,
  );

  const recentInbound = await all<{ body: string; channel: string; createdAt: string; msisdn: string }>(
    `SELECT m.body, m.channel, m.createdAt, r.msisdn
       FROM Message m JOIN Rider r ON r.id = m.riderId
      WHERE m.direction = 'IN'
      ORDER BY m.createdAt DESC LIMIT 5`,
  );

  const recentUssd = await all<{ msisdn: string; state: string; updatedAt: string; active: number }>(
    "SELECT msisdn, state, updatedAt, active FROM UssdSession ORDER BY updatedAt DESC LIMIT 5",
  );

  const callbacks = [
    {
      provider: "Africa's Talking",
      where: "USSD → Service codes → your channel → Callback URL",
      label: "USSD callback",
      url: `${base}/api/ussd${secret}`,
    },
    {
      provider: "Africa's Talking",
      where: "SMS → SMS Callback URLs → Delivery Reports",
      label: "SMS delivery reports",
      url: `${base}/api/sms/dlr${secret}`,
    },
    {
      provider: "Africa's Talking",
      where: "SMS → SMS Callback URLs → Incoming Messages",
      label: "Inbound SMS (keyword replies)",
      url: `${base}/api/sms/inbound${secret}`,
    },
    {
      provider: "Meta for Developers",
      where: "WhatsApp → Configuration → Webhook → Callback URL",
      label: "WhatsApp webhook",
      url: `${base}/api/whatsapp/webhook`,
      extra: `Verify token: ${process.env.WHATSAPP_VERIFY_TOKEN ?? "bodapesa"} · Signature check: ${process.env.WHATSAPP_APP_SECRET ? "on" : "off — set WHATSAPP_APP_SECRET"}`,
    },
  ];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[2rem] leading-tight">Integrations</h1>
        <p className="text-xs text-[var(--text-faint)] mt-0.5">
          Channel status, the callback URLs each provider needs, and a live test to prove delivery end to end.
        </p>
      </header>

      {/* --------------------------------------------------------- status */}
      <Card>
        <SectionTitle title="Channel status" subtitle="Set by environment variables — no code changes needed" />
        <div className="grid gap-2 sm:grid-cols-2">
          {providers.map((p) => (
            <div
              key={p.channel}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: "var(--surface-2)" }}
            >
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-[0.7rem] text-[var(--text-faint)]">{p.channel}</div>
              </div>
              <ModePill mode={p.mode} />
            </div>
          ))}
          <div
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg"
            style={{ background: "var(--surface-2)" }}
          >
            <div>
              <div className="text-sm font-medium">Database</div>
              <div className="text-[0.7rem] text-[var(--text-faint)]">
                {dbKind === "postgres" ? "Hosted Postgres" : "Local SQLite file"}
              </div>
            </div>
            <Pill tone={dbKind === "postgres" ? "brand" : "neutral"}>{dbKind}</Pill>
          </div>
        </div>
        <dl className="mt-4 grid gap-1.5 text-[0.76rem] sm:grid-cols-3">
          <div>
            <dt className="text-[var(--text-faint)]">Simulated</dt>
            <dd className="text-[var(--text-muted)]">No credentials. Nothing leaves the platform.</dd>
          </div>
          <div>
            <dt className="text-[var(--text-faint)]">Provider sandbox</dt>
            <dd className="text-[var(--text-muted)]">Real API calls; messages land in the provider&rsquo;s simulator.</dd>
          </div>
          <div>
            <dt className="text-[var(--text-faint)]">Live</dt>
            <dd className="text-[var(--text-muted)]">Real messages to real phones, billed to the account.</dd>
          </div>
        </dl>
      </Card>

      {/* ------------------------------------------------------ callbacks */}
      <Card>
        <SectionTitle
          title="Callback URLs to register"
          subtitle="Paste each into the provider dashboard at the location shown"
        />
        {isLocal ? (
          <div
            className="text-[0.78rem] p-3 rounded-lg mb-4"
            style={{ background: "var(--accent-soft)", color: "var(--text-muted)" }}
          >
            <strong style={{ color: "var(--accent)" }}>This is a local address.</strong> Providers cannot reach{" "}
            <code>{base}</code> from the internet. Open this page on your deployed URL and these addresses will
            update to match.
          </div>
        ) : null}
        {!env.webhookSecret ? (
          <div
            className="text-[0.78rem] p-3 rounded-lg mb-4"
            style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
          >
            <strong>Tip:</strong> set <code>WEBHOOK_SECRET</code> in your environment. It is appended to the
            Africa&rsquo;s Talking URLs below so that nobody who guesses the address can inject fake messages.
          </div>
        ) : null}
        <div className="space-y-3">
          {callbacks.map((c) => (
            <div key={c.label}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 mb-1">
                <span className="text-[0.82rem] font-medium">{c.label}</span>
                <span className="text-[0.7rem] text-[var(--text-faint)]">
                  {c.provider} · {c.where}
                </span>
              </div>
              <CopyField value={c.url} />
              {c.extra ? <div className="text-[0.7rem] text-[var(--text-faint)] mt-1">{c.extra}</div> : null}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ------------------------------------------------------ test send */}
        <Card>
          <SectionTitle
            title="Send a live test"
            subtitle="Sends one real message. Use your own number or a teammate's who has agreed."
          />
          <TestSend />
        </Card>

        {/* ------------------------------------------------- recent results */}
        <Card>
          <SectionTitle
            title="Recent direct sends"
            subtitle="Refreshes on reload — DELIVERED appears when the network's report arrives"
          />
          {recentTests.length ? (
            <ul className="space-y-2">
              {recentTests.map((m) => (
                <li key={m.id} className="text-[0.78rem] flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="tabular-nums">
                      {displayMsisdn(m.msisdn)} <span className="text-[var(--text-faint)]">· {m.channel}</span>
                    </div>
                    {m.error ? (
                      <div className="text-[0.7rem]" style={{ color: "var(--danger)" }}>
                        {m.error}
                      </div>
                    ) : (
                      <div className="text-[0.68rem] text-[var(--text-faint)] truncate">
                        ref {m.providerRef ?? "—"}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <Pill tone={STATUS_TONE[m.status]}>{m.status}</Pill>
                    <div className="text-[0.66rem] text-[var(--text-faint)] mt-0.5">{timeAgo(m.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.8rem] text-[var(--text-faint)]">No direct sends yet.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Inbound messages" subtitle="Proves the inbound SMS and WhatsApp callbacks work" />
          {recentInbound.length ? (
            <ul className="space-y-2">
              {recentInbound.map((m, i) => (
                <li key={i} className="text-[0.78rem]">
                  <span className="tabular-nums">{displayMsisdn(m.msisdn)}</span>
                  <span className="text-[var(--text-faint)]">
                    {" "}
                    · {m.channel} · {timeAgo(m.createdAt)}
                  </span>
                  <div className="text-[var(--text-muted)]">&ldquo;{m.body}&rdquo;</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.8rem] text-[var(--text-faint)]">No inbound messages received yet.</p>
          )}
        </Card>

        <Card>
          <SectionTitle title="USSD sessions" subtitle="Proves the USSD callback is being reached" />
          {recentUssd.length ? (
            <ul className="space-y-2">
              {recentUssd.map((s, i) => (
                <li key={i} className="text-[0.78rem] flex justify-between gap-3">
                  <span>
                    <span className="tabular-nums">{displayMsisdn(s.msisdn)}</span>
                    <span className="text-[var(--text-faint)]">
                      {" "}
                      · menu path{" "}
                      {/* free-text entries (names typed at registration) are masked */}
                      {s.state
                        .split("*")
                        .map((part) => (/^\d{1,2}$/.test(part) || part === "ROOT" ? part : "•••"))
                        .join(" › ")}
                    </span>
                  </span>
                  <span className="text-[0.7rem] text-[var(--text-faint)] shrink-0">{timeAgo(s.updatedAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.8rem] text-[var(--text-faint)]">No USSD sessions yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
