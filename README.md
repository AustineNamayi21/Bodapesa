# BodaPesa

**A multi-channel financial literacy and inclusion platform for boda boda riders in Nairobi.**

Built in partnership with **Stima DT SACCO** (savings, credit, investment) and **Britam** (insurance,
pensions, asset management).

> **Going live?** Follow [`docs/GO-LIVE.md`](docs/GO-LIVE.md) — a step-by-step runbook from laptop to a
> public URL sending real SMS.

---

## The problem

A Nairobi boda boda rider handles cash every working day and is almost entirely outside the formal
financial system. Income arrives daily rather than monthly, which fits none of the products banks and
insurers are built around. The consequences compound:

- **No cushion.** A puncture, a fine or a sick child is met with a 1%-a-day digital loan rather than savings.
- **No cover.** Most riders hold only the third-party motor policy the law requires — which does not cover
  their passenger and does not cover them.
- **No record.** Years of reliable daily earnings produce no credit history, so asset finance that would
  convert a daily hire fee into ownership is out of reach.
- **No pension.** Riding has a limited physical window and no employer is building anything for afterwards.

Knowledge is not the whole problem, but it is the part that unlocks the rest: a rider who understands what
1% a day actually costs, what passenger liability cover is, and how SACCO deposits become loan collateral
makes different decisions.

## What the platform does

BodaPesa delivers a structured financial literacy curriculum over the channels riders actually use, then
connects them directly to real products from the two partner institutions and hands qualified leads back
to those institutions to work.

```
Register & consent  →  Learn  →  Be reached  →  Be onboarded
   stage / USSD /       12 lessons    segmented       lead routed to
   SMS / field         3 languages    campaigns       Stima or Britam
```

Every stage is measured, and the funnel on the dashboard tracks riders through all four.

### 1. Registration and consent

Riders are enrolled at their stage by a field officer, by dialling the USSD code, or by replying `JIUNGE`
to an SMS. USSD asks for explicit consent before anything is stored, and every consented registration is
confirmed with a welcome SMS. The platform captures language, preferred channel and a **financial-inclusion baseline** —
SACCO membership, insurance held, bank account, bike ownership, daily income band. That baseline is what the
programme measures its impact against. No campaign is ever sent to a rider without consent; replying
`STOP` / `ACHA` opts out immediately.

### 2. The curriculum

Twelve lessons across **Savings, Credit, Investment and Insurance**, each written in **English, Kiswahili
and Sheng**, in two forms: a full version for the rider portal, and a condensed version that fits one SMS or
USSD screen — so the *same curriculum* reaches a feature phone. Each lesson carries a quiz; the rider's
**financial literacy score** is 60% curriculum coverage and 40% quiz accuracy.

### 3. Multi-channel mass messaging

Write once in three languages, target an audience, and each rider is reached on **the channel they chose**:

| Channel | Reach | Cost | Provider |
|---|---|---|---|
| **SMS** | Every handset | ~KSh 0.80 / part | Africa's Talking |
| **USSD** | Every handset | Free to the rider | Africa's Talking |
| **WhatsApp** | Smartphones | Free inside a 24-hour chat; ≈KSh 2.90 per template | Meta Cloud API (approved templates outside the 24-hour window) |
| **In-app** | Portal users | Free | — |

Audiences are defined by stage, sub-county, language, programme status, income band, literacy score and
inclusion gaps (*"riders not yet insured"*). The count shown in the composer comes from the same query that
selects recipients — the test suite asserts they match. Every message is written to the log **before** the
provider is called, and delivery is confirmed by the network's own delivery report.

### 4. Onboarding to real products

19 partner products are catalogued. A rider who taps *"Ninavutiwa"* in the app, presses 1 on USSD, or
replies `NDIO` to an SMS generates a **lead** routed to the institution that owns the product. Partner staff
see only their own pipeline and work leads to conversion, which updates the rider's inclusion baseline and
closes the measurement loop.

---

## Running it locally

**Requires Node.js 22.5 or newer.**

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. On Windows you can instead double-click **`start.bat`**, which checks your
Node version, installs dependencies when needed, starts the server and opens your browser.

The database is a local SQLite file, created and filled with demonstration data on the first request.

| Route | For |
|---|---|
| `/admin` | Programme team and partner institutions |
| `/rider` | Riders with a smartphone |
| `/ussd` | The USSD menu, exactly as a rider on a feature phone sees it |
| `/admin/integrations` | Channel status, callback URLs, and live test sends |
| `/api/health` | Deployment health check |

### Demo accounts (development only)

| Role | Email | Password |
|---|---|---|
| Platform admin | `admin@bodapesa.ke` | `bodapesa2026` |
| Stima SACCO | `sacco@stima.co.ke` | `stima2026` |
| Britam | `agent@britam.co.ke` | `britam2026` |

**These passwords are refused in production** — the deployed site requires your own, set as environment
variables.

### Commands

```bash
npm run dev              # development server
npm run build            # production build
npm run db:seed          # reference data only (partners, products, curriculum)
npm run db:seed:demo     # reference data plus synthetic riders and history
npm run db:reset         # drop everything, then reseed with demo data
npm run test:providers   # 32 contract tests for the SMS and WhatsApp adapters
npm run verify           # 30-check end-to-end browser test (needs the server running)
```

All `db:*` commands act on whatever `DATABASE_URL` points to, so the same commands prepare a hosted
database from your laptop.

---

## Channel modes

Each channel runs in one of three modes, set entirely by environment variables — no code changes:

| Mode | When | What happens |
|---|---|---|
| **Simulated** | No credentials | Messages are persisted, costed and given simulated delivery reports. Nothing leaves the platform. |
| **Provider sandbox** | `AT_USERNAME=sandbox` + key | Real API calls to Africa's Talking; messages appear in its phone simulator. |
| **Live** | Live username + key | Real messages to real phones, billed to the account. |

**Demonstration riders are never sent a real message.** The synthetic riders have generated numbers that
may belong to real people, so every one is flagged and messages to them are always simulated — even on a
live account. A campaign to the whole register sends real SMS only to real riders; the composer shows the
split and costs only the real messages before anything is sent.

---

## Architecture

```
src/
├── app/
│   ├── admin/                Console: dashboard, riders, campaigns, messages, leads,
│   │                         products, curriculum, integrations
│   ├── rider/                Mobile-first rider portal
│   ├── ussd/                 USSD handset simulator
│   └── api/
│       ├── ussd/             Africa's Talking USSD callback
│       ├── sms/inbound/      Keyword replies (SOMO, NDIO, AKIBA, ACHA …)
│       ├── sms/dlr/          Delivery reports
│       ├── whatsapp/webhook/ Meta verification, receipts and inbound messages
│       ├── segment/estimate/ Live audience estimate for the composer
│       └── health/           Deployment health check
├── lib/
│   ├── db.ts                 Async data layer: SQLite (local) or Postgres (production)
│   ├── env.ts                Validated configuration, rate limiting, webhook guard
│   ├── auth.ts               scrypt password hashing, signed-cookie sessions
│   ├── segments.ts           Audience definition → SQL
│   ├── analytics.ts          Dashboard aggregates and impact metrics
│   ├── actions.ts            Server actions
│   ├── channels/
│   │   ├── providers.ts      SMS / WhatsApp / USSD / in-app adapters, three modes
│   │   ├── dispatch.ts       Campaign dispatch, WhatsApp service window, delivery simulation
│   │   └── ussd.ts           USSD menu state machine
│   └── seed*.ts              Partner catalogue, trilingual curriculum, demo data
docs/
├── GO-LIVE.md                Deployment runbook
└── schema.prisma             Data model (ERD)
scripts/
├── seed.ts                   Database seeding and reset
├── test-providers.ts         Adapter contract tests
└── verify.mjs                End-to-end browser verification
```

**Stack.** Next.js 16 (App Router, React Server Components, server actions), TypeScript, Tailwind CSS 4.
PostgreSQL in production via `node-postgres`; SQLite locally via Node's built-in `node:sqlite`.

### The data layer

One async API over two drivers, chosen by whether `DATABASE_URL` is a `postgres://` string. Application
code is identical against both, so the platform develops offline and deploys without a code change.

Production runs serverless (Vercel) against Postgres reached through a **transaction-mode connection
pooler** (Neon's default). That combination creates problems a single server never sees, and the data
layer is built around them:

- **Cold-start races.** Several instances can hit an empty database at once. Creating the schema and
  seeding it run under a single cross-instance lock, so exactly one instance does the work.
- **Pooler-safe locking.** Through a transaction-mode pooler, consecutive statements from one client can
  land on different server connections, so an ordinary session lock can be taken on one and "released"
  on another. The lock is transaction-scoped instead: a transaction stays pinned to one connection until
  it commits, and the commit releases the lock.
- **No pool starvation.** Waiting instances *try* the lock rather than block on it, releasing their
  connection between attempts. A blocking lock lets waiters occupy the whole pool and deadlock the
  instance doing the work — this was reproduced and fixed.
- **Atomic seeding.** All seeding happens on the lock-holding connection inside one transaction. A failure
  part-way rolls back completely; there is no half-seeded state.
- **Batched writes.** Seeding and campaign dispatch use multi-row inserts. The full demo seed is 59
  statements instead of about 4,000 — the difference between two seconds and a minute over a network.

### Security

- Production **refuses to start** without a unique `SESSION_SECRET` and `ADMIN_PASSWORD`, and rejects the
  published demo passwords.
- Partner staff accounts are only created when their passwords are supplied.
- Provider callbacks are protected by a shared secret and rate-limited; sign-in is rate-limited by
  address and by account.
- Riders sign in to the portal with a **one-time code texted to their phone** — a phone number alone
  proves nothing. The code is never stored or logged; the browser holds a signed, ten-minute ticket.
- USSD registration asks for **explicit consent** before anything is saved; declining stores nothing.
- The public USSD simulator cannot open a real rider's account, and riders it registers are
  demonstration riders that are never sent a real message.
- Phone numbers are never listed publicly outside demo mode, and free-text USSD input is masked in the
  admin view.
- Standard security headers on every response.

---

## Verification

| Suite | What it proves | Result |
|---|---|---|
| `npm run verify` | 30 end-to-end behaviours in a real browser, against SQLite and against production Postgres | 30/30 on both |
| `npm run test:providers` | Adapters build correct requests and explain every rejection in plain language | 32/32 |
| Seeding race | 5 processes seeding one empty database through a transaction-mode pooler | 1 seeds, 4 wait, no errors, over 15 runs |
| Crash atomicity | A failure planted half-way through seeding | Zero rows survive |
| Synthetic safety | A whole-register campaign on a configured SMS account | Only real riders reach the provider |
| Onboarding, production mode | Consent (agree and decline), welcome SMS from USSD and field registration, web-simulator isolation, SMS sign-in code (right, wrong, cleared, never logged) — against a mocked SMS gateway | 20/20 |

The browser suite asserts, among other things, that the audience shown equals the messages dispatched,
that partner staff see only their own leads, that quizzes update the literacy score, and that no screen
throws a JavaScript error in light or dark mode. Screenshots of every screen are written to `screenshots/`.

---

## Scope and limits

Stated plainly, because examiners will ask:

- **USSD short code.** The menu runs on an Africa's Talking sandbox channel. A dedicated Safaricom code
  costs KES 145,000 set-up plus KES 70,000 a month — a commercial step outside the project's scope.
- **Partner integration.** Leads are held in BodaPesa's own pipeline. Pushing them into Stima's and
  Britam's systems would need their IT teams and APIs.
- **Product figures.** Structures follow the partners' published products; rates, premiums and limits are
  indicative and flagged as such throughout. They must be confirmed with the institutions.
- **Literacy score.** A reasonable construct, not a validated psychometric instrument.
- **Data protection.** A live deployment holding real riders' data requires registration with Kenya's
  Office of the Data Protection Commissioner under the Data Protection Act 2019.
- **Rider data.** The seeded riders, campaigns and message history are synthetic demonstration data.

## Donations

The site has a public **/donate** page (M-Pesa STK Push + card via Flutterwave). Setup and go-live steps: [docs/DONATIONS.md](docs/DONATIONS.md).
