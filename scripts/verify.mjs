/**
 * End-to-end verification of the BodaPesa platform.
 *
 * Drives a real browser through the admin console and the rider portal,
 * asserting the critical flows and capturing screenshots for the report.
 * Run with the dev server up:  node scripts/verify.mjs [baseUrl]
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
// Production refuses the published demo passwords, so credentials can be
// supplied through the environment when verifying a deployed instance.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@bodapesa.ke";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "bodapesa2026";
const BRITAM_PASSWORD = process.env.BRITAM_PASSWORD ?? "britam2026";
const SHOTS = "screenshots";
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

// Photos load from Unsplash's CDN. Against a local server (often offline) they
// are replaced with a placeholder so a missing network is not reported as a
// page error; against a deployed URL the real images load.
const STUB_PHOTOS = process.env.STUB_PHOTOS ?? (/localhost|127\.0\.0\.1/.test(BASE) ? "1" : "0");
const PLACEHOLDER =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc21a"/><stop offset="1" stop-color="#ff5a1f"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>';
async function newCtx(options) {
  const ctx = await browser.newContext(options);
  if (STUB_PHOTOS === "1") {
    await ctx.route("https://images.unsplash.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "image/svg+xml", body: PLACEHOLDER }),
    );
  }
  return ctx;
}

async function run() {
  // ------------------------------------------------------------ admin ----
  const admin = await newCtx({ viewport: { width: 1400, height: 1000 } });
  const page = await admin.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${SHOTS}/01-landing.png`, fullPage: true });
  check("Landing page renders", await page.locator("h1").first().isVisible());

  // guard
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  check("Unauthenticated /admin redirects to login", page.url().includes("/login"));

  // login
  await page.fill("#email", ADMIN_EMAIL);
  await page.fill("#password", ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin", { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  check("Admin can sign in", page.url().endsWith("/admin"));

  const kpi = await page.locator(".stat-value").first().textContent();
  check("Dashboard shows KPIs", Boolean(kpi && kpi.trim().length), `first KPI = ${kpi?.trim()}`);
  check("Trend chart rendered", (await page.locator("svg").count()) > 0);
  await page.screenshot({ path: `${SHOTS}/02-dashboard.png`, fullPage: true });

  // riders
  await page.goto(`${BASE}/admin/riders`, { waitUntil: "networkidle" });
  const riderRows = await page.locator("table tbody tr").count();
  check("Rider registry lists riders", riderRows > 0, `${riderRows} rows`);
  await page.screenshot({ path: `${SHOTS}/03-riders.png`, fullPage: true });

  // rider detail
  const firstRiderHref = await page.locator('table tbody tr a[href^="/admin/riders/"]').first().getAttribute("href");
  await page.goto(`${BASE}${firstRiderHref}`, { waitUntil: "networkidle" });
  check("Rider detail opens", page.url().includes("/admin/riders/") && (await page.locator("text=Financial literacy").count()) > 0);
  await page.screenshot({ path: `${SHOTS}/04-rider-detail.png`, fullPage: true });

  // ------------------------------------------- campaign: compose & send ----
  await page.goto(`${BASE}/admin/campaigns/new`, { waitUntil: "networkidle" });
  const name = `Verification run ${new Date().toISOString().slice(11, 19)}`;
  await page.fill("#name", name);

  // target a narrow, checkable segment: uninsured riders only
  await page.selectOption("#hasInsurance", "no");
  await page.waitForTimeout(900);
  const audienceText = await page.locator(".stat-value").first().textContent();
  const audience = Number((audienceText ?? "0").replace(/[^0-9]/g, ""));
  check("Live audience estimate updates", audience > 0, `${audience} riders match "uninsured"`);

  // fill the three language bodies from a lesson template
  await page.selectOption("#lessonTemplate", { index: 10 });
  await page.waitForTimeout(300);
  const sw = await page.inputValue("#bodySw");
  check("Lesson template populates all languages", sw.length > 20, `Kiswahili body ${sw.length} chars`);

  await page.check('input[name="channels"][value="WHATSAPP"]');
  await page.screenshot({ path: `${SHOTS}/05-campaign-composer.png`, fullPage: true });

  await page.click('button:has-text("Save as draft")');
  await page.waitForURL(/\/admin\/campaigns\/cmp_/, { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  check("Campaign draft saved", (await page.locator("text=DRAFT").count()) > 0);
  const campaignUrl = page.url();

  await page.click('button:has-text("Send to")');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await page.goto(campaignUrl, { waitUntil: "networkidle" });

  const sentBadge = await page.locator("text=SENT").count();
  const sentCount = Number(
    ((await page.locator('.card:has(.stat-label:text-is("Messages sent")) .stat-value').first().textContent()) ?? "0")
      .replace(/[^0-9]/g, ""),
  );
  check("Campaign dispatched", sentBadge > 0 && sentCount > 0, `${sentCount} messages sent`);
  check("Dispatched count matches the audience estimate", sentCount === audience, `${sentCount} vs ${audience}`);
  await page.screenshot({ path: `${SHOTS}/06-campaign-sent.png`, fullPage: true });

  // remaining admin pages
  for (const [path, label] of [
    ["/admin/messages", "Message log"],
    ["/admin/leads", "Lead pipeline"],
    ["/admin/products", "Product catalogue"],
    ["/admin/curriculum", "Curriculum"],
  ]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    check(`${label} renders`, await page.locator("h1").first().isVisible());
  }
  await page.screenshot({ path: `${SHOTS}/07-leads.png`, fullPage: true });
  await page.goto(`${BASE}/admin/products`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${SHOTS}/08-products.png`, fullPage: true });

  // partner-scoped access
  const britam = await newCtx({ viewport: { width: 1400, height: 1000 } });
  const bpage = await britam.newPage();
  await bpage.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await bpage.fill("#email", "agent@britam.co.ke");
  await bpage.fill("#password", BRITAM_PASSWORD);
  await bpage.click('button[type="submit"]');
  await bpage.waitForURL("**/admin", { timeout: 15000 });
  await bpage.goto(`${BASE}/admin/leads`, { waitUntil: "networkidle" });
  const partnerNames = await bpage.locator("table tbody tr td:nth-child(2)").allTextContents();
  const onlyBritam = partnerNames.length > 0 && partnerNames.every((t) => t.includes("Britam"));
  check("Partner staff only see their own pipeline", onlyBritam, `${partnerNames.length} leads, all Britam`);
  await britam.close();

  // ------------------------------------------------------ rider portal ----
  const riderCtx = await newCtx({ viewport: { width: 420, height: 900 }, isMobile: true, hasTouch: true });
  const rp = await riderCtx.newPage();
  rp.on("pageerror", (e) => errors.push(String(e)));

  await rp.goto(`${BASE}/rider`, { waitUntil: "networkidle" });
  const sampleNumber = await rp.locator("code").first().textContent();
  check("Rider portal offers a demo number", Boolean(sampleNumber));

  await rp.fill("#msisdn", sampleNumber ?? "");
  await rp.click('button[type="submit"]');
  await rp.waitForURL("**/rider/home", { timeout: 15000 });
  await rp.waitForLoadState("networkidle");
  check("Rider can sign in with their phone number", rp.url().includes("/rider/home"));
  await rp.screenshot({ path: `${SHOTS}/09-rider-home.png`, fullPage: true });

  // language switch
  await rp.click('button[name="language"][value="SW"]');
  await rp.waitForTimeout(1200);
  const swahili = await rp.locator("h1").first().textContent();
  await rp.click('button[name="language"][value="EN"]');
  await rp.waitForTimeout(1200);
  const english = await rp.locator("h1").first().textContent();
  check(
    "Rider can switch language",
    Boolean(swahili?.startsWith("Habari") && english?.startsWith("Hello")),
    `${swahili} → ${english}`,
  );

  // learn -> lesson -> quiz
  await rp.goto(`${BASE}/rider/learn`, { waitUntil: "networkidle" });
  check("Curriculum lists lessons", (await rp.locator('a[href^="/rider/learn/"]').count()) >= 12);
  await rp.screenshot({ path: `${SHOTS}/10-rider-learn.png`, fullPage: true });

  await rp.goto(`${BASE}/rider/learn/INS-2`, { waitUntil: "networkidle" });
  const radios = rp.locator('input[type="radio"]');
  const radioCount = await radios.count();
  check("Lesson shows its quiz", radioCount >= 4, `${radioCount} options`);

  // answer every question (first option of each group) and submit
  const groups = [...new Set(await radios.evaluateAll((els) => els.map((e) => e.name)))];
  for (const g of groups) await rp.locator(`input[name="${g}"]`).first().check();
  await rp.click('button[type="submit"]');
  await rp.waitForLoadState("networkidle");
  await rp.waitForTimeout(800);
  const scored = (await rp.locator("text=/Score|Alama/").count()) > 0;
  check("Quiz grades and records the attempt", scored);
  await rp.screenshot({ path: `${SHOTS}/11-rider-quiz.png`, fullPage: true });

  // products -> express interest (creates a lead)
  await rp.goto(`${BASE}/rider/products`, { waitUntil: "networkidle" });
  const interestButtons = rp.locator('button:has-text("interested"), button:has-text("Ninavutiwa"), button:has-text("Niko down")');
  const before = await interestButtons.count();
  if (before > 0) {
    await interestButtons.first().click();
    await rp.waitForLoadState("networkidle");
    await rp.waitForTimeout(600);
  }
  const after = await interestButtons.count();
  check("Rider can request a product", before > 0 && after < before, `${before} → ${after} available`);
  await rp.screenshot({ path: `${SHOTS}/12-rider-products.png`, fullPage: true });

  // savings goal
  await rp.goto(`${BASE}/rider/goal`, { waitUntil: "networkidle" });
  await rp.screenshot({ path: `${SHOTS}/13-rider-goal.png`, fullPage: true });
  check("Savings goal screen renders", await rp.locator("h1").first().isVisible());

  await rp.goto(`${BASE}/rider/inbox`, { waitUntil: "networkidle" });
  check("Rider inbox renders", await rp.locator("h1").first().isVisible());

  // ---------------------------------------------------------- USSD UI ----
  const up = await admin.newPage();
  await up.setViewportSize({ width: 1400, height: 1000 });
  await up.goto(`${BASE}/ussd`, { waitUntil: "networkidle" });
  await up.fill('input[placeholder="0712 345 678"]', "0799123456");
  await up.click('button:has-text("Dial")');
  await up.waitForTimeout(900);
  const screen1 = await up.locator(".ussd-screen").textContent();
  check("USSD simulator dials", Boolean(screen1 && screen1.includes("Karibu")), screen1?.slice(0, 40));

  await up.fill('input[placeholder="Type your reply…"]', "1");
  await up.click('button:has-text("Send")');
  await up.waitForTimeout(700);
  const screen2 = await up.locator(".ussd-screen").textContent();
  check("USSD simulator advances the menu", Boolean(screen2 && screen2.includes("jina")), screen2?.slice(0, 40));
  await up.screenshot({ path: `${SHOTS}/14-ussd.png`, fullPage: true });

  // ------------------------------------------------------- dark mode ----
  const dark = await newCtx({ viewport: { width: 1400, height: 1000 }, colorScheme: "dark" });
  const dp = await dark.newPage();
  await dp.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await dp.fill("#email", ADMIN_EMAIL);
  await dp.fill("#password", ADMIN_PASSWORD);
  await dp.click('button[type="submit"]');
  await dp.waitForURL("**/admin", { timeout: 15000 });
  await dp.waitForLoadState("networkidle");
  const bg = await dp.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check("Dark mode applies", bg !== "rgb(246, 247, 245)", `body background ${bg}`);
  await dp.screenshot({ path: `${SHOTS}/15-dashboard-dark.png`, fullPage: true });
  await dark.close();

  check("No uncaught JavaScript errors", errors.length === 0, errors.slice(0, 3).join(" | "));

  await riderCtx.close();
  await admin.close();
}

try {
  await run();
} catch (err) {
  check("Verification run completed", false, String(err).slice(0, 300));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("Failures:");
  failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
  process.exit(1);
}
