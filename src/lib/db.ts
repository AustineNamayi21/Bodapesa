import path from "node:path";
import fs from "node:fs";
import { AsyncLocalStorage } from "node:async_hooks";
import type { PoolClient } from "pg";

/**
 * BodaPesa data layer.
 *
 * Two drivers behind one async API:
 *
 *   • SQLite  — Node's built-in `node:sqlite`. Zero native dependencies, used
 *               for local development and for the automated test suite.
 *   • Postgres — used in production, where the host has no persistent disk.
 *
 * The driver is chosen by the presence of DATABASE_URL. Application code is
 * identical against either, so the platform can be developed offline and
 * deployed without a code change.
 *
 * The logical model is documented in `docs/schema.prisma`; the DDL below is
 * the physical implementation of that model.
 */

const BASE_DDL = `
CREATE TABLE IF NOT EXISTS Partner (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  accent TEXT NOT NULL DEFAULT '#0f766e',
  contactMsisdn TEXT,
  website TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS AppUser (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL,
  partnerId TEXT REFERENCES Partner(id),
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Stage (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subCounty TEXT NOT NULL,
  ward TEXT,
  lat REAL_TYPE,
  lng REAL_TYPE,
  chairperson TEXT,
  chairMsisdn TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Rider (
  id TEXT PRIMARY KEY,
  msisdn TEXT UNIQUE NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  nationalId TEXT,
  gender TEXT,
  ageBand TEXT,
  language TEXT NOT NULL DEFAULT 'SW',
  channelPref TEXT NOT NULL DEFAULT 'SMS',
  stageId TEXT REFERENCES Stage(id),
  dailyIncomeBand TEXT,
  ownsMotorbike INTEGER NOT NULL DEFAULT 0,
  hasBankAccount INTEGER NOT NULL DEFAULT 0,
  saccoMember INTEGER NOT NULL DEFAULT 0,
  hasInsurance INTEGER NOT NULL DEFAULT 0,
  usesMobileMoney INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'PROSPECT',
  literacyScore INTEGER NOT NULL DEFAULT 0,
  consent INTEGER NOT NULL DEFAULT 0,
  consentAt TEXT,
  registeredVia TEXT NOT NULL DEFAULT 'FIELD',
  isSynthetic INTEGER NOT NULL DEFAULT 0,
  lastActiveAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rider_status ON Rider(status);
CREATE INDEX IF NOT EXISTS idx_rider_stage ON Rider(stageId);

CREATE TABLE IF NOT EXISTS Product (
  id TEXT PRIMARY KEY,
  partnerId TEXT NOT NULL REFERENCES Partner(id),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'wallet',
  summaryEn TEXT NOT NULL,
  summarySw TEXT NOT NULL,
  summarySh TEXT NOT NULL,
  detailsEn TEXT NOT NULL,
  detailsSw TEXT NOT NULL,
  minAmount REAL_TYPE,
  maxAmount REAL_TYPE,
  interestRate TEXT,
  premium TEXT,
  termLabel TEXT,
  eligibility TEXT,
  requiresMembership INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_product_category ON Product(category);

CREATE TABLE IF NOT EXISTS Lesson (
  id TEXT PRIMARY KEY,
  moduleKey TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL,
  titleEn TEXT NOT NULL,
  titleSw TEXT NOT NULL,
  titleSh TEXT NOT NULL,
  bodyEn TEXT NOT NULL,
  bodySw TEXT NOT NULL,
  bodySh TEXT NOT NULL,
  smsEn TEXT NOT NULL,
  smsSw TEXT NOT NULL,
  smsSh TEXT NOT NULL,
  durationMin INTEGER NOT NULL DEFAULT 4,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS QuizQuestion (
  id TEXT PRIMARY KEY,
  lessonId TEXT NOT NULL REFERENCES Lesson(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  promptEn TEXT NOT NULL,
  promptSw TEXT NOT NULL,
  promptSh TEXT NOT NULL,
  optionsJson TEXT NOT NULL,
  correctIndex INTEGER NOT NULL,
  explanationEn TEXT NOT NULL,
  explanationSw TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS LessonProgress (
  id TEXT PRIMARY KEY,
  riderId TEXT NOT NULL REFERENCES Rider(id) ON DELETE CASCADE,
  lessonId TEXT NOT NULL REFERENCES Lesson(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'APP',
  completedAt TEXT NOT NULL,
  UNIQUE(riderId, lessonId)
);

CREATE TABLE IF NOT EXISTS QuizAttempt (
  id TEXT PRIMARY KEY,
  riderId TEXT NOT NULL REFERENCES Rider(id) ON DELETE CASCADE,
  lessonId TEXT NOT NULL REFERENCES Lesson(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  channel TEXT NOT NULL DEFAULT 'APP',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Campaign (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  productId TEXT REFERENCES Product(id),
  bodyEn TEXT NOT NULL,
  bodySw TEXT NOT NULL,
  bodySh TEXT NOT NULL,
  channels TEXT NOT NULL,
  segmentJson TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  scheduledAt TEXT,
  sentAt TEXT,
  createdById TEXT REFERENCES AppUser(id),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Message (
  id TEXT PRIMARY KEY,
  campaignId TEXT REFERENCES Campaign(id) ON DELETE SET NULL,
  riderId TEXT NOT NULL REFERENCES Rider(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  language TEXT NOT NULL,
  body TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'OUT',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  providerRef TEXT,
  costKes REAL_TYPE NOT NULL DEFAULT 0,
  error TEXT,
  createdAt TEXT NOT NULL,
  sentAt TEXT,
  deliveredAt TEXT,
  readAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_message_campaign ON Message(campaignId);
CREATE INDEX IF NOT EXISTS idx_message_rider ON Message(riderId);
CREATE INDEX IF NOT EXISTS idx_message_status ON Message(status);
CREATE INDEX IF NOT EXISTS idx_message_ref ON Message(providerRef);

CREATE TABLE IF NOT EXISTS Lead (
  id TEXT PRIMARY KEY,
  riderId TEXT NOT NULL REFERENCES Rider(id) ON DELETE CASCADE,
  productId TEXT NOT NULL REFERENCES Product(id),
  partnerId TEXT NOT NULL REFERENCES Partner(id),
  status TEXT NOT NULL DEFAULT 'NEW',
  source TEXT NOT NULL DEFAULT 'APP',
  note TEXT,
  valueKes REAL_TYPE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lead_status ON Lead(status);
CREATE INDEX IF NOT EXISTS idx_lead_partner ON Lead(partnerId);

CREATE TABLE IF NOT EXISTS SavingsGoal (
  id TEXT PRIMARY KEY,
  riderId TEXT NOT NULL REFERENCES Rider(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  targetAmount REAL_TYPE NOT NULL,
  dailyTarget REAL_TYPE NOT NULL DEFAULT 0,
  targetDate TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS SavingsDeposit (
  id TEXT PRIMARY KEY,
  goalId TEXT NOT NULL REFERENCES SavingsGoal(id) ON DELETE CASCADE,
  amount REAL_TYPE NOT NULL,
  note TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS UssdSession (
  id TEXT PRIMARY KEY,
  sessionId TEXT UNIQUE NOT NULL,
  msisdn TEXT NOT NULL,
  riderId TEXT REFERENCES Rider(id),
  state TEXT NOT NULL DEFAULT 'MENU',
  contextJson TEXT NOT NULL DEFAULT '{}',
  transcript TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
`;

/**
 * Postgres folds unquoted identifiers to lower case, so `firstName` comes back
 * as `firstname`. Rather than quoting every identifier in every query, the
 * Postgres driver maps result keys back to the camelCase the application
 * expects. The map is derived from the DDL, plus the aliases used in joins.
 */
const EXTRA_ALIASES = [
  "stageName",
  "partnerName",
  "partnerCode",
  "partnerAccent",
  "campaignName",
  "productName",
  "avgScore",
  "riderId",
  "msgs",
];

function buildKeyMap(): Map<string, string> {
  const map = new Map<string, string>();
  const identifiers = new Set<string>(EXTRA_ALIASES);
  for (const match of BASE_DDL.matchAll(/^\s{2}([A-Za-z_][A-Za-z0-9_]*)\s/gm)) {
    identifiers.add(match[1]);
  }
  for (const name of identifiers) {
    if (name !== name.toLowerCase()) map.set(name.toLowerCase(), name);
  }
  return map;
}

const KEY_MAP = buildKeyMap();

function restoreKeys(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[KEY_MAP.get(key) ?? key] = value;
  }
  return out;
}

/** Rewrites `?` placeholders to Postgres `$1, $2, …`, ignoring quoted literals. */
function toPgPlaceholders(sql: string): string {
  let out = "";
  let n = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    if (ch === "?" && !inSingle && !inDouble) {
      out += `$${++n}`;
    } else {
      out += ch;
    }
  }
  return out;
}

type Primitive = string | number | bigint | null | Uint8Array;

function normalise(value: unknown): Primitive {
  if (value === undefined || value === null) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" || typeof value === "bigint") return value;
  if (value instanceof Uint8Array) return value;
  return String(value);
}

// --------------------------------------------------------------- drivers --

interface Driver {
  readonly kind: "sqlite" | "postgres";
  query(sql: string, params: Primitive[]): Promise<Record<string, unknown>[]>;
  migrate(): Promise<void>;
  /** Runs `fn` while holding a cross-instance lock (no-op on SQLite). */
  withLock<T>(key: number, fn: () => Promise<T>): Promise<T>;
}

function sqliteDdl(): string {
  return `PRAGMA journal_mode = WAL;\nPRAGMA foreign_keys = ON;\n${BASE_DDL.replace(/REAL_TYPE/g, "REAL")}`;
}

function postgresDdl(): string {
  return BASE_DDL.replace(/REAL_TYPE/g, "DOUBLE PRECISION");
}

let sqliteQueue: Promise<void> = Promise.resolve();

async function createSqliteDriver(): Promise<Driver> {
  const { DatabaseSync } = await import("node:sqlite");
  const file = process.env.DATABASE_FILE ?? path.join(process.cwd(), "data", "bodapesa.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const database = new DatabaseSync(file);

  return {
    kind: "sqlite",
    async query(sql, params) {
      const stmt = database.prepare(sql);
      // node:sqlite returns null-prototype objects, which React refuses to
      // serialise across the server/client boundary — copy into plain objects.
      if (/^\s*(select|with|pragma)/i.test(sql)) {
        return (stmt.all(...params) as Record<string, unknown>[]).map((r) => ({ ...r }));
      }
      stmt.run(...params);
      return [];
    },
    async migrate() {
      // A database file left by the first version of BodaPesa has a different
      // staff table and no synthetic-rider flag. Running against it would
      // treat the generated demo riders as real people — so on a live SMS
      // account they would be sent real messages. Detect it before touching
      // the schema at all, and refuse with the fix.
      const tableExists = (name: string) =>
        Boolean(database.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name));
      if (tableExists("Rider")) {
        const riderColumns = (database.prepare("PRAGMA table_info(Rider)").all() as { name: string }[]).map(
          (c) => c.name,
        );
        if (tableExists("User") || !riderColumns.includes("isSynthetic")) {
          throw new Error(
            "[bodapesa] This database file was created by an earlier version of BodaPesa and is not " +
              "compatible. Stop the server, run `npm run db:reset`, then start it again. " +
              "(It only holds demonstration data.)",
          );
        }
      }
      database.exec(sqliteDdl());
    },
    async withLock(_key, fn) {
      // One local process and one connection: serialise locked sections with
      // an in-process queue, and run each inside a transaction so a failure
      // part-way leaves nothing behind.
      const previous = sqliteQueue;
      let release!: () => void;
      sqliteQueue = new Promise<void>((r) => (release = r));
      await previous;
      try {
        database.exec("BEGIN");
        const result = await fn();
        database.exec("COMMIT");
        return result;
      } catch (err) {
        try {
          database.exec("ROLLBACK");
        } catch {
          // no transaction open
        }
        throw err;
      } finally {
        release();
      }
    },
  };
}

async function createPostgresDriver(url: string): Promise<Driver> {
  const pg = await import("pg");
  const { Pool, types } = pg.default ?? pg;

  // node-postgres returns bigint and numeric as strings to avoid precision
  // loss. Every such column here is a count or a shilling amount well inside
  // the safe integer range, so parse them as numbers.
  types.setTypeParser(20, (v: string) => Number(v)); // int8
  types.setTypeParser(1700, (v: string) => Number(v)); // numeric

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes("localhost") || url.includes("sslmode=disable") ? undefined : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  // While a locked section runs, every query inside it is routed to the one
  // connection that holds the lock. AsyncLocalStorage carries that
  // connection through the async call chain without threading it by hand.
  const lockClient = new AsyncLocalStorage<PoolClient>();

  async function query(sql: string, params: Primitive[]) {
    const pinned = lockClient.getStore();
    const result = pinned
      ? await pinned.query(toPgPlaceholders(sql), params)
      : await pool.query(toPgPlaceholders(sql), params);
    return result.rows.map(restoreKeys);
  }

  /**
   * Runs `fn` exclusively across every instance of the app, atomically.
   *
   * Three properties matter on a serverless host reaching Postgres through a
   * transaction-mode pooler (which is what Neon's DATABASE_URL is):
   *
   *  1. Transaction-scoped lock. Through such a pooler, consecutive
   *     statements from one client can land on different server connections,
   *     so a session lock could be taken on one backend and "released" on
   *     another. A transaction is pinned to one backend until COMMIT, and the
   *     COMMIT itself releases the lock.
   *
   *  2. Waiters hold nothing. The lock is *tried*, not awaited. An instance
   *     that doesn't get it releases its connection, backs off and retries —
   *     so waiting instances can never occupy the whole pool and starve the
   *     instance doing the work. (A blocking lock deadlocks a small pool.)
   *
   *  3. One connection, one transaction. Everything `fn` does runs on the
   *     connection holding the lock, inside that transaction. It never needs
   *     a second connection, and if it fails part-way the work rolls back
   *     instead of leaving a half-seeded database.
   */
  async function withLock<T>(key: number, fn: () => Promise<T>): Promise<T> {
    // Already inside a locked section on this call chain: run in place.
    if (lockClient.getStore()) return fn();

    const deadline = Date.now() + 60_000;
    for (;;) {
      const client = await pool.connect();
      let acquired = false;
      try {
        await client.query("BEGIN");
        const { rows } = await client.query("SELECT pg_try_advisory_xact_lock($1) AS ok", [key]);
        acquired = rows[0]?.ok === true;
        if (acquired) {
          const result = await lockClient.run(client, fn);
          await client.query("COMMIT");
          return result;
        }
        await client.query("ROLLBACK");
      } catch (err) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw err;
      } finally {
        client.release();
      }

      if (Date.now() > deadline) {
        throw new Error(`[bodapesa] Timed out after 60s waiting for database lock ${key}`);
      }
      await new Promise((r) => setTimeout(r, 150 + Math.random() * 350));
    }
  }

  return {
    kind: "postgres",
    query,
    async migrate() {
      // Fast path: the schema is created in a single transaction, so if its
      // last table exists, all of it does. `to_regclass` takes no locks.
      // Skipping here matters: even a no-op `CREATE INDEX IF NOT EXISTS`
      // takes a table lock, which can deadlock against a seed in progress.
      const exists = await pool.query("SELECT to_regclass('ussdsession') IS NOT NULL AS ok");
      if (exists.rows[0]?.ok === true) return;

      // Migration shares the bootstrap lock with seeding, so the two can
      // never overlap across instances.
      await withLock(BOOTSTRAP_LOCK, async () => {
        await lockClient.getStore()!.query(postgresDdl());
      });
    },
    withLock,
  };
}

// One advisory-lock key for everything that bootstraps a fresh database —
// creating the schema and seeding it — so those steps are mutually exclusive
// across every running instance.
const BOOTSTRAP_LOCK = 72_653_001;
export const SEED_LOCK = BOOTSTRAP_LOCK;

const globalForDb = globalThis as unknown as {
  __bodapesaDriver?: Promise<Driver>;
  __bodapesaMigrated?: Promise<void>;
};

function driver(): Promise<Driver> {
  if (!globalForDb.__bodapesaDriver) {
    const url = process.env.DATABASE_URL ?? "";
    // Only a genuine Postgres connection string selects the Postgres driver —
    // anything else (including a leftover SQLite path) falls back to the
    // built-in driver rather than failing at connection time.
    const usePostgres = /^postgres(ql)?:\/\//i.test(url);
    globalForDb.__bodapesaDriver = usePostgres ? createPostgresDriver(url) : createSqliteDriver();
  }
  return globalForDb.__bodapesaDriver;
}

/**
 * Drops every table, including ones left by earlier versions, without first
 * running the migration (which refuses to run against an old schema).
 */
export async function resetDatabase(): Promise<void> {
  const d = await driver();
  const tables = [
    "SavingsDeposit", "SavingsGoal", "UssdSession", "Lead", "Message", "Campaign",
    "QuizAttempt", "LessonProgress", "QuizQuestion", "Lesson", "Product", "Rider",
    "Stage", "AppUser", "Partner",
  ];
  if (d.kind === "postgres") {
    // CASCADE removes dependent constraints, so order doesn't matter.
    for (const t of tables) await d.query(`DROP TABLE IF EXISTS ${t} CASCADE`, []);
  } else {
    // SQLite has no CASCADE on DROP. Suspend foreign-key enforcement so the
    // tables can be dropped in any order — including "User", the staff table
    // of the first version, which other tables still reference.
    await d.query("PRAGMA foreign_keys = OFF", []);
    try {
      for (const t of [...tables, "User"]) await d.query(`DROP TABLE IF EXISTS "${t}"`, []);
    } finally {
      await d.query("PRAGMA foreign_keys = ON", []);
    }
  }
  globalForDb.__bodapesaMigrated = undefined;
}

/** Creates the schema if it does not exist. Safe to call on every request. */
export function migrate(): Promise<void> {
  if (!globalForDb.__bodapesaMigrated) {
    globalForDb.__bodapesaMigrated = driver().then((d) => d.migrate());
  }
  return globalForDb.__bodapesaMigrated;
}

export async function databaseKind(): Promise<"sqlite" | "postgres"> {
  return (await driver()).kind;
}

// ------------------------------------------------------------------- API --

/** Run a query returning rows. */
export async function all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  await migrate();
  const d = await driver();
  return (await d.query(sql, params.map(normalise))) as T[];
}

/** Run a query returning at most one row. */
export async function one<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await all<T>(sql, params);
  return rows.length ? rows[0] : null;
}

/** Run a statement (INSERT/UPDATE/DELETE). */
export async function run(sql: string, params: unknown[] = []): Promise<void> {
  await migrate();
  const d = await driver();
  await d.query(sql, params.map(normalise));
}

/** Scalar aggregate helper. */
export async function count(sql: string, params: unknown[] = []): Promise<number> {
  const row = await one<{ n: number | string }>(sql, params);
  return row ? Number(row.n ?? 0) : 0;
}

export function id(prefix = "c"): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export function now(): string {
  return new Date().toISOString();
}

const quoteIdentifier = (name: string) => (name === "order" ? `"order"` : name);

/** Insert helper: builds the statement from an object. */
export async function insert(table: string, data: Record<string, unknown>): Promise<string> {
  const keys = Object.keys(data);
  const cols = keys.map(quoteIdentifier).join(", ");
  const placeholders = keys.map(() => "?").join(", ");
  await run(
    `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`,
    keys.map((k) => data[k]),
  );
  return data.id as string;
}

/**
 * Inserts many rows with multi-row VALUES statements.
 *
 * Against a hosted database every statement is a network round trip, so
 * seeding thousands of rows one at a time takes tens of seconds. Batching
 * turns ~4,000 round trips into a few dozen. Batch size is kept well under
 * the Postgres limit of 65,535 bound parameters per statement.
 */
export async function bulkInsert(table: string, rows: Record<string, unknown>[], batchSize = 250): Promise<void> {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const cols = keys.map(quoteIdentifier).join(", ");
  const rowPlaceholder = `(${keys.map(() => "?").join(", ")})`;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values = batch.map(() => rowPlaceholder).join(", ");
    const params = batch.flatMap((row) => keys.map((k) => row[k]));
    await run(`INSERT INTO ${table} (${cols}) VALUES ${values}`, params);
  }
}

/** Runs `fn` under a lock shared by every running instance of the app. */
export async function withLock<T>(key: number, fn: () => Promise<T>): Promise<T> {
  await migrate();
  return (await driver()).withLock(key, fn);
}

/** Update helper. */
export async function update(table: string, idValue: string, data: Record<string, unknown>): Promise<void> {
  const keys = Object.keys(data);
  if (!keys.length) return;
  const sets = keys.map((k) => `${quoteIdentifier(k)} = ?`).join(", ");
  await run(`UPDATE ${table} SET ${sets} WHERE id = ?`, [...keys.map((k) => data[k]), idValue]);
}

export const bool = (v: unknown) => Number(v) === 1;
