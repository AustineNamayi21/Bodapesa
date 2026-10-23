#!/usr/bin/env node
/**
 * Adds the Donations feature to the shared files of an existing BodaPesa repo.
 *
 * Run from the repo root:   node apply-donations.mjs
 *
 * It only ADDS the donation lines and leaves everything else in each file
 * untouched. It is safe to run twice. If a file has changed so much that a
 * spot can't be found, that file is left unmodified and the script tells you
 * exactly what to add by hand.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
if (!fs.existsSync(path.join(root, "package.json")) || !fs.existsSync(path.join(root, "src"))) {
  console.error("Run this from the BodaPesa project folder (the one containing package.json and src).");
  process.exit(1);
}

const DDL = "\nCREATE TABLE IF NOT EXISTS Donation (\n  id TEXT PRIMARY KEY,\n  txRef TEXT UNIQUE NOT NULL,\n  method TEXT NOT NULL,\n  provider TEXT NOT NULL,\n  live INTEGER NOT NULL DEFAULT 0,\n  amountKes REAL_TYPE NOT NULL,\n  donorName TEXT,\n  donorEmail TEXT,\n  donorMsisdn TEXT,\n  note TEXT,\n  anonymous INTEGER NOT NULL DEFAULT 0,\n  status TEXT NOT NULL DEFAULT 'PENDING',\n  providerRef TEXT,\n  receipt TEXT,\n  failureReason TEXT,\n  createdAt TEXT NOT NULL,\n  updatedAt TEXT NOT NULL,\n  paidAt TEXT\n);\nCREATE INDEX IF NOT EXISTS idx_donation_status ON Donation(status);\nCREATE INDEX IF NOT EXISTS idx_donation_providerref ON Donation(providerRef);\n";
const README_ADD = "\n## Donations\n\nThe site has a public **/donate** page (M-Pesa STK Push + card via Flutterwave). Setup and go-live steps: [docs/DONATIONS.md](docs/DONATIONS.md).\n";
const ENV_ADD = "\n# \u2500\u2500 Donations: M-Pesa (Safaricom Daraja STK Push) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n# Leave unset \u2192 donations are simulated (demo mode only; never counted as raised).\n# Get sandbox keys at https://developer.safaricom.co.ke \u2192 My Apps.\n# Sandbox shortcode 174379 + the public sandbox passkey from the Daraja docs.\n# MPESA_ENV=sandbox            # sandbox | production\n# MPESA_CONSUMER_KEY=\n# MPESA_CONSUMER_SECRET=\n# MPESA_SHORTCODE=             # Paybill, or Store/Head Office number for a Till\n# MPESA_PASSKEY=\n# For a Till number instead of a Paybill:\n# MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline\n# MPESA_PARTY_B=               # the Till number\n\n# \u2500\u2500 Donations: card payments (Flutterwave Standard v3) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n# FLWSECK_TEST-\u2026 key \u2192 test mode; a live key \u2192 real charges.\n# FLW_SECRET_KEY=\n# Secret hash you set in Flutterwave Dashboard \u2192 Settings \u2192 Webhooks.\n# FLW_WEBHOOK_HASH=\n\n# \u2500\u2500 Donations: public page \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n# Shown to donors as who they are giving to.\n# DONATION_ORG_NAME=\n# Optional fundraising goal in KES \u2014 shows a progress bar on /donate.\n# DONATION_GOAL_KES=\n";

const FILES = {
  "src/lib/db.ts": [
    {
      name: "Donation table in the schema",
      done: (s) => s.includes("CREATE TABLE IF NOT EXISTS Donation"),
      apply: (s) => {
        const anchor = "  updatedAt TEXT NOT NULL\n);\n`;\n\n/**\n * Postgres folds";
        if (!s.includes(anchor)) return null;
        return s.replace(anchor, "  updatedAt TEXT NOT NULL\n);\n" + DDL + "`;\n\n/**\n * Postgres folds");
      },
    },
    {
      name: "Donation in the reset list",
      done: (s) => s.includes('"Donation", "SavingsDeposit"'),
      apply: (s) =>
        s.includes('"SavingsDeposit", "SavingsGoal", "UssdSession",')
          ? s.replace('"SavingsDeposit", "SavingsGoal", "UssdSession",', '"Donation", "SavingsDeposit", "SavingsGoal", "UssdSession",')
          : null,
    },
    {
      name: "Postgres migration check covers the Donation table",
      done: (s) => s.includes("to_regclass('donation')"),
      apply: (s) => {
        const old =
          '      const exists = await pool.query("SELECT to_regclass(\'ussdsession\') IS NOT NULL AS ok");\n      if (exists.rows[0]?.ok === true) return;';
        if (!s.includes(old)) return null;
        const neu =
          "      // Checks the first AND the most recently added table, so a database\n" +
          "      // created before a later table existed (e.g. Donation) is topped up —\n" +
          "      // every statement is CREATE ... IF NOT EXISTS, so re-running is safe.\n" +
          "      const exists = await pool.query(\n" +
          "        \"SELECT (to_regclass('ussdsession') IS NOT NULL AND to_regclass('donation') IS NOT NULL) AS ok\",\n" +
          "      );\n" +
          "      if (exists.rows[0]?.ok === true) return;";
        return s.replace(old, neu);
      },
    },
  ],

  "src/app/page.tsx": [
    {
      name: "Donate button in the hero",
      done: (s) => s.includes('href="/donate" className="btn btn-accent"'),
      apply: (s) => {
        const anchor = '          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">';
        if (!s.includes(anchor)) return null;
        const cta =
          '          <div className="mt-6 flex flex-wrap gap-2">\n' +
          '            <Link href="/donate" className="btn btn-accent">\n' +
          "              Support our movement\n" +
          "            </Link>\n" +
          '            <Link href="/rider" className="btn btn-ghost">\n' +
          "              Open the rider portal\n" +
          "            </Link>\n" +
          "          </div>\n\n";
        return s.replace(anchor, cta + anchor);
      },
    },
    {
      name: "Support band on the landing page",
      done: (s) => s.includes("Help us reach more riders"),
      apply: (s) => {
        const anchor = "      {/* ------------------------------------------------------- how it works */}";
        if (!s.includes(anchor)) return null;
        const band =
          "      {/* ---------------------------------------------------------- support */}\n" +
          '      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">\n' +
          "        <div\n" +
          '          className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"\n' +
          '          style={{ background: "var(--accent-soft)", borderColor: "transparent" }}\n' +
          "        >\n" +
          '          <div className="max-w-xl">\n' +
          '            <h2 className="font-semibold tracking-tight">Help us reach more riders</h2>\n' +
          '            <p className="text-[0.85rem] leading-relaxed mt-1 text-[var(--text-muted)]">\n' +
          "              Every lesson we send is free to the rider. Well-wishers can give by M-Pesa or card to keep the\n" +
          "              curriculum reaching new stages across Nairobi.\n" +
          "            </p>\n" +
          "          </div>\n" +
          '          <Link href="/donate" className="btn btn-accent shrink-0">\n' +
          "            Donate →\n" +
          "          </Link>\n" +
          "        </div>\n" +
          "      </section>\n\n";
        return s.replace(anchor, band + anchor);
      },
    },
    {
      name: "Support link in the footer",
      done: (s) => s.includes("Support us"),
      apply: (s) => {
        const old = "          <span>BodaPesa — financial literacy platform for boda boda riders, Nairobi.</span>";
        if (!s.includes(old)) return null;
        const neu =
          "          <span>\n" +
          "            BodaPesa — financial literacy platform for boda boda riders, Nairobi.{\" \"}\n" +
          '            <Link href="/donate" className="underline underline-offset-2 hover:text-[var(--text)]">\n' +
          "              Support us\n" +
          "            </Link>\n" +
          "          </span>";
        return s.replace(old, neu);
      },
    },
  ],

  "src/app/api/health/route.ts": [
    {
      name: "Payments status import",
      done: (s) => s.includes("@/lib/payments/config"),
      apply: (s) =>
        s.includes('import { ensureSeeded } from "@/lib/seed";')
          ? s.replace('import { ensureSeeded } from "@/lib/seed";', 'import { ensureSeeded } from "@/lib/seed";\nimport { cardMode, mpesaMode } from "@/lib/payments/config";')
          : null,
    },
    {
      name: "Payments status in the health response",
      done: (s) => s.includes("payments: { mpesa: mpesaMode()"),
      apply: (s) => {
        const old = "      channels: Object.fromEntries(providerStatus().map((p) => [p.channel, p.mode])),";
        return s.includes(old) ? s.replace(old, old + "\n      payments: { mpesa: mpesaMode(), card: cardMode() },") : null;
      },
    },
  ],

  "src/app/admin/NavLinks.tsx": [
    {
      name: "Donations menu item",
      done: (s) => s.includes('"/admin/donations"'),
      apply: (s) => {
        const a = '  { href: "/admin/products", label: "Products", icon: "◆" },';
        return s.includes(a) ? s.replace(a, a + '\n  { href: "/admin/donations", label: "Donations", icon: "♡" },') : null;
      },
    },
    {
      name: "Donations hidden from partner admins",
      done: (s) => /l\.href !== "\/admin\/donations"/.test(s),
      apply: (s) => {
        const a = 'l.href !== "/admin/curriculum" && l.href !== "/admin/integrations")';
        return s.includes(a)
          ? s.replace(a, 'l.href !== "/admin/curriculum" && l.href !== "/admin/integrations" && l.href !== "/admin/donations")')
          : null;
      },
    },
  ],

  ".env.example": [
    {
      name: "Donation settings documented",
      done: (s) => s.includes("MPESA_CONSUMER_KEY"),
      apply: (s) => s.replace(/\n*$/, "\n") + ENV_ADD.replace(/^\n+/, "\n"),
    },
  ],

  "README.md": [
    {
      name: "Donations section",
      done: (s) => s.includes("docs/DONATIONS.md"),
      apply: (s) => s.replace(/\n*$/, "\n") + README_ADD.replace(/^\n+/, "\n"),
    },
  ],
};

let manual = 0;
for (const [rel, steps] of Object.entries(FILES)) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.log(`!  ${rel}: file not found — skipped`);
    manual++;
    continue;
  }
  const raw = fs.readFileSync(file, "utf8");
  const crlf = raw.includes("\r\n");
  let text = raw.replace(/\r\n/g, "\n");
  const log = [];
  let failed = false;

  for (const step of steps) {
    if (step.done(text)) {
      log.push(`   already done: ${step.name}`);
      continue;
    }
    const next = step.apply(text);
    if (next === null) {
      log.push(`   COULD NOT APPLY: ${step.name}`);
      failed = true;
    } else {
      text = next;
      log.push(`   added: ${step.name}`);
    }
  }

  if (failed) {
    manual++;
    console.log(`!  ${rel}: left unchanged (this file differs from what I expected)`);
  } else if (text.replace(/\n/g, "\r\n") === raw || text === raw) {
    console.log(`=  ${rel}: nothing to do`);
  } else {
    fs.writeFileSync(file, crlf ? text.replace(/\n/g, "\r\n") : text);
    console.log(`ok ${rel}`);
  }
  log.forEach((l) => console.log(l));
}

console.log(
  manual
    ? `\n${manual} file(s) need a manual step — copy the output above and send it to Claude.`
    : "\nAll done. Next: npm run build, then commit and push in GitHub Desktop.",
);
process.exit(manual ? 1 : 0);
