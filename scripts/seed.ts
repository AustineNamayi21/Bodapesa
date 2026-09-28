/**
 * Seeds the database named by DATABASE_URL (or the local SQLite file).
 *
 *   npx tsx scripts/seed.ts            reference data only (partners, products, curriculum)
 *   npx tsx scripts/seed.ts --demo     reference data plus synthetic riders and history
 *   npx tsx scripts/seed.ts --reset    drop every table first, then seed
 *
 * Use this to prepare a hosted database from your own machine before the
 * first visitor arrives, rather than making that visitor wait for it.
 */

const args = new Set(process.argv.slice(2));
if (args.has("--demo")) process.env.SEED_DEMO_DATA = "true";
if (!args.has("--demo") && !process.env.SEED_DEMO_DATA) process.env.SEED_DEMO_DATA = "false";

// Development defaults are fine for a local seed; a production seed must
// supply real values, and env.ts enforces that.
process.env.SESSION_SECRET ??= "bodapesa-dev-secret-change-in-production";
process.env.ADMIN_PASSWORD ??= "bodapesa2026";

async function main() {
  const db = await import("../src/lib/db");
  const { seed, isSeeded } = await import("../src/lib/seed");

  const kind = await db.databaseKind();
  const target = kind === "postgres" ? new URL(process.env.DATABASE_URL!).host : "local SQLite file";
  console.log(`Database: ${kind} (${target})`);

  if (args.has("--reset")) {
    console.log("Dropping existing tables…");
    await db.resetDatabase();
  }

  const started = Date.now();
  // Same lock the running app takes, so seeding from a laptop can never
  // collide with a deployed instance seeding the same database.
  const result = await db.withLock(db.SEED_LOCK, async () => ((await isSeeded()) ? null : seed()));
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  if (!result) {
    console.log("Already seeded — nothing to do. Pass --reset to start again.");
    return;
  }

  console.log(`Seeded in ${seconds}s:`);
  console.log(JSON.stringify(result, null, 2));
  if (!result.demoData) {
    console.log("Reference data only. Run with --demo to add synthetic riders for demonstrations.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

export {};
