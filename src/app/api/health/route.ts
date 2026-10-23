import { NextResponse } from "next/server";
import { count, databaseKind } from "@/lib/db";
import { providerStatus } from "@/lib/channels/providers";
import { ensureSeeded } from "@/lib/seed";
import { cardMode, mpesaMode } from "@/lib/payments/config";

export const dynamic = "force-dynamic";

/**
 * Deployment health check.
 *
 * Open /api/health after a deploy to confirm, in one request, that the app
 * can reach its database, that the schema and reference data exist, and which
 * channels are simulated, on a provider sandbox, or live. No secrets or
 * personal data are ever included.
 */
export async function GET() {
  const started = Date.now();
  try {
    // The natural first request after a deploy: creates the schema and the
    // reference data if this is a fresh database.
    await ensureSeeded();
    const [database, partners, products, lessons, riders] = await Promise.all([
      databaseKind(),
      count("SELECT COUNT(*) AS n FROM Partner"),
      count("SELECT COUNT(*) AS n FROM Product"),
      count("SELECT COUNT(*) AS n FROM Lesson"),
      count("SELECT COUNT(*) AS n FROM Rider"),
    ]);

    return NextResponse.json({
      ok: true,
      database,
      seeded: partners > 0,
      counts: { partners, products, lessons, riders },
      channels: Object.fromEntries(providerStatus().map((p) => [p.channel, p.mode])),
      payments: { mpesa: mpesaMode(), card: cardMode() },
      node: process.version,
      latencyMs: Date.now() - started,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: (err as Error).message,
        hint: "Check DATABASE_URL — it must be a postgres:// connection string reachable from the host.",
      },
      { status: 503 },
    );
  }
}
