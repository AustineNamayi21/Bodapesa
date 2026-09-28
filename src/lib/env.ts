/**
 * Environment configuration, validated once at module load.
 *
 * The platform is deployed to a public URL, so a handful of settings that are
 * harmless in development are dangerous in production — a default session
 * secret, a published admin password, synthetic rider records in the live
 * register. Each is checked here rather than trusted at the point of use.
 */

const DEV_SECRET = "bodapesa-dev-secret-change-in-production";
const DEV_ADMIN_PASSWORD = "bodapesa2026";

export const isProduction = process.env.NODE_ENV === "production";

// `next build` also runs with NODE_ENV=production and imports server modules
// while collecting page data. Secrets are enforced when the app serves
// requests, not while it compiles — otherwise the build itself would fail on
// any machine that doesn't hold the production secrets.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

function requiredInProduction(name: string, value: string | undefined, insecureDefault?: string): string {
  const missing = !value || value.trim() === "";
  const insecure = insecureDefault !== undefined && value === insecureDefault;

  if (isProduction && !isBuildPhase && (missing || insecure)) {
    throw new Error(
      `[bodapesa] ${name} must be set to a unique value in production. ` +
        `Generate one with:  node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"`,
    );
  }
  return value ?? insecureDefault ?? "";
}

export const env = {
  /** Signing key for admin and rider session cookies. */
  sessionSecret: requiredInProduction("SESSION_SECRET", process.env.SESSION_SECRET, DEV_SECRET),

  /**
   * The platform administrator created on first run. In production these must
   * be supplied; in development they fall back to the documented demo login.
   */
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@bodapesa.ke",
  adminPassword: requiredInProduction("ADMIN_PASSWORD", process.env.ADMIN_PASSWORD, DEV_ADMIN_PASSWORD),

  /**
   * Partner staff passwords. In development they default to the documented
   * demo logins; in production an account is only created if its password is
   * supplied — a known password on a public URL would expose rider data.
   */
  partnerPasswords: {
    STIMA: process.env.STIMA_PASSWORD || (isProduction ? "" : "stima2026"),
    BRITAM: process.env.BRITAM_PASSWORD || (isProduction ? "" : "britam2026"),
  } as Record<string, string>,

  /**
   * Demonstration helpers: listing sample rider numbers on the sign-in and
   * USSD pages so a visitor can try the platform immediately. Safe only while
   * every rider in the database is synthetic, so off by default in production.
   */
  demoMode: process.env.DEMO_MODE ? process.env.DEMO_MODE === "true" : !isProduction,

  /**
   * Whether to populate the register with synthetic riders, campaigns and
   * message history. Useful for demonstrations, never wanted in a deployment
   * that will hold real rider data. Off by default in production.
   */
  seedDemoData: process.env.SEED_DEMO_DATA
    ? process.env.SEED_DEMO_DATA === "true"
    : !isProduction,

  /**
   * Optional shared secret appended to provider callback URLs. Africa's Talking
   * does not sign its webhooks, so a secret in the path is the practical way to
   * stop anyone who guesses the URL from injecting messages.
   */
  webhookSecret: process.env.WEBHOOK_SECRET ?? "",

  /** Public base URL, used when printing the callback URLs to register. */
  publicUrl:
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : ""),
};

/** True when the login page may advertise the demo accounts. */
export const showDemoCredentials = !isProduction && env.adminPassword === DEV_ADMIN_PASSWORD;

/**
 * Guards a provider webhook. Returns null when the request is allowed, or a
 * Response to return immediately when it is not.
 */
export function checkWebhookSecret(request: Request): Response | null {
  if (!env.webhookSecret) return null;
  const url = new URL(request.url);
  const supplied = url.searchParams.get("secret") ?? request.headers.get("x-bodapesa-secret") ?? "";
  if (supplied === env.webhookSecret) return null;
  return new Response("Forbidden", { status: 403 });
}

// ------------------------------------------------------------ rate limit --

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * A small fixed-window rate limiter held in memory.
 *
 * This is deliberately modest: it protects the login form and the public
 * webhooks from casual abuse on a single instance. It is not a distributed
 * limiter, and the README says so — a multi-instance deployment would move
 * this to Redis or the platform's edge configuration.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }
  return true;
}

export function clientKey(request: Request, prefix: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return `${prefix}:${ip}`;
}
