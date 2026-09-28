# BodaPesa — Go-live runbook

This takes BodaPesa from your laptop to a public URL that sends real SMS, runs a
real USSD menu on the Africa's Talking simulator, and talks to WhatsApp.

Work through the stages **in order** — each one depends on the last. Every stage
ends with a check, so you always know it worked before moving on.

| Stage | What you get | Cost | Time |
|---|---|---|---|
| 1. GitHub | Code online, ready to deploy | Free | 10 min |
| 2. Vercel + Neon | Public URL and hosted database | Free | 20 min |
| 3. Africa's Talking sandbox | Real SMS + USSD in the simulator | Free | 30 min |
| 4. Live SMS | Real SMS to real phones | ~KES 0.80/SMS | 20 min |
| 5. WhatsApp | Real WhatsApp messages | Free at demo scale | 1–2 hrs + template approval |

> **Never paste an API key, token or password into a chat, a screenshot, or a
> file you commit to GitHub.** They go only into Vercel's Environment Variables
> screen (and your local `.env`, which is git-ignored).

---

## Stage 1 — Put the code on GitHub

No commands needed — GitHub Desktop does it all.

1. Create a free account at <https://github.com> if you don't have one.
2. Install **GitHub Desktop** (<https://desktop.github.com>) and sign in to it
   with that account.
3. **File → Add local repository…** → choose the `BodaPesa` folder. It will say
   the folder isn't a Git repository yet — click **create a repository** there.
   Keep the name `BodaPesa`, set **Git ignore** and **License** to **None** (the
   project already has its own `.gitignore`), and click **Create repository**.
   GitHub Desktop makes the first commit for you.
4. Click **Publish repository**. Keep **Keep this code private** ticked, and publish.

Later changes: GitHub Desktop lists them — write a summary, **Commit to main**,
then **Push origin**. Vercel redeploys automatically on every push.

<details><summary>Prefer the command line?</summary>

```bash
git init -b main
git add .
git commit -m "BodaPesa platform"
git remote add origin https://github.com/YOUR-USERNAME/bodapesa.git
git push -u origin main
```
</details>

**Check:** refresh the repository page — you should see `src/`, `docs/`,
`scripts/` and `README.md`. You should **not** see `.env`, `data/`,
`data-v1-backup/` or `node_modules/` (the `.gitignore` keeps them out).

---

## Stage 2 — Deploy to Vercel with a Neon database

### 2a. Import the project

1. Sign in at <https://vercel.com> **with your GitHub account**.
2. **Add New → Project**, pick the `bodapesa` repository, click **Import**.
3. Framework preset should say **Next.js**. Don't deploy yet — first the database.

### 2b. Add the database

1. In the project, open the **Storage** tab → **Create Database** → **Neon**
   (Serverless Postgres). Pick the free plan and the region closest to Vercel's
   (for Nairobi, a European or US-East region is fine).
2. Connect it to the project for **Production** and **Preview**.

This automatically adds `DATABASE_URL` to the project. That variable is Neon's
*pooled* connection string, which is exactly what BodaPesa expects — no changes
needed. (The platform's locking is built specifically to be safe through that
pooler.)

### 2c. Set the environment variables

**Settings → Environment Variables**. Add each of these for **Production**:

| Name | Value | Notes |
|---|---|---|
| `SESSION_SECRET` | a long random string | Generate one: `node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"` |
| `ADMIN_EMAIL` | your email | Your admin login |
| `ADMIN_PASSWORD` | a strong password | **Not** `bodapesa2026` — production refuses the demo password |
| `STIMA_PASSWORD` | a strong password | Creates the Stima SACCO staff login. Leave unset for no Stima account |
| `BRITAM_PASSWORD` | a strong password | Creates the Britam staff login. Leave unset for no Britam account |
| `WEBHOOK_SECRET` | a random string | Protects the Africa's Talking callbacks |
| `DEMO_MODE` | `false` | Keep it off — see below |

**About `DEMO_MODE`.** Off (the production default), the platform treats every
real rider's number as private:

- the rider portal signs a rider in only after a **six-digit code texted to
  their phone** (so SMS must be configured — stage 3 or 4);
- the on-site USSD simulator will not open a real rider's account, and riders
  it registers are marked as demonstration riders that are never sent a real
  message (they can open the portal without a code, since they hold no one's
  real data).

Turning it **on** lists sample numbers on the sign-in pages and lets any
registered number into the portal with no code. That is only acceptable while
every rider in the database is synthetic — never once a real person has
registered.

### 2d. Deploy

**Deployments → Redeploy** (or push any commit). Wait for **Ready**.

### 2e. Load the data

The site creates its schema and reference data (partners, 19 products, the
12-lesson curriculum) automatically on the first request. For your defence you
probably also want the synthetic riders and history so the dashboard has
something to show. Load them **from your laptop**:

1. In Vercel, **Storage → your Neon database → .env.local** tab → copy the
   `DATABASE_URL` line.
2. In the project folder:

   ```bash
   DATABASE_URL="paste-the-value-here" \
   ADMIN_EMAIL="the same email you set in Vercel" \
   ADMIN_PASSWORD="the same password you set in Vercel" \
   STIMA_PASSWORD="same as Vercel" \
   BRITAM_PASSWORD="same as Vercel" \
   npm run db:reset
   ```

   On Windows PowerShell, set each one first with
   `$env:DATABASE_URL="..."` and so on, then run `npm run db:reset`.

   The passwords must match Vercel's, because this command creates the staff
   accounts.

### ✅ Check stage 2

Open `https://YOUR-PROJECT.vercel.app/api/health`. You should see:

```json
{ "ok": true, "database": "postgres", "seeded": true,
  "counts": { "partners": 2, "products": 19, "lessons": 12, "riders": 240 }, … }
```

Then sign in at `/login` with your admin email and password, and open
**Integrations** in the sidebar. Every callback URL on that page now shows your
real Vercel address — you'll copy them in the next stages.

---

## Stage 3 — Africa's Talking sandbox (free)

The sandbox makes **real API calls** from your deployed platform. Messages
appear in Africa's Talking's phone simulator instead of on real handsets. This
is the stage that proves the SMS and USSD integration works end to end, at no
cost.

### 3a. Account and API key

1. Create an account at <https://account.africastalking.com> and verify your
   email.
2. Open the **Sandbox** app (every account has one).
3. Go to **Settings → API Key**, generate a key and copy it once — it is not
   shown again.

### 3b. Tell BodaPesa about it

In Vercel **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `AT_USERNAME` | `sandbox` |
| `AT_API_KEY` | the key you just generated |

Leave `AT_SENDER_ID` **unset**. An unregistered sender ID makes every message
fail.

**Redeploy.** On the Integrations page, Africa's Talking SMS should now say
**Provider sandbox**.

### 3c. Register the callbacks

On BodaPesa's **Integrations** page, click **Copy** beside each URL and paste it
into the sandbox app:

| BodaPesa URL | Where it goes in Africa's Talking |
|---|---|
| SMS delivery reports | **SMS → SMS Callback URLs → Delivery Reports** |
| Inbound SMS | **SMS → SMS Callback URLs → Incoming Messages** |
| USSD callback | the USSD channel you create next |

### 3d. Create the USSD channel

1. **USSD → Create Channel** in the sandbox app.
2. Pick an available channel number and give it a name like `BodaPesa`.
3. Paste the **USSD callback** URL from the Integrations page.

Ask for channel **7788** so the code is `*384*7788#` — the code every
message, lesson and screen in BodaPesa already quotes. If it is taken, pick
another and change `*384*7788#` throughout the source (one search-and-replace).

**Consent.** A new rider is asked to agree before anything is stored:
language → name → stage → *"BodaPesa will keep your name and number… 1. I agree
2. No thanks"*. Choosing 2 saves nothing. Choosing 1 registers them and sends a
**welcome SMS** straight away.

### ✅ Check stage 3

1. Open the simulator at <https://simulator.africastalking.com> and log in with
   any phone number.
2. **USSD:** dial `*384*7788#`. The BodaPesa menu appears. Register (agree to
   the consent screen), take a lesson, request a product. The **welcome SMS**
   lands in the simulator's inbox a moment after you register.
3. **SMS:** on BodaPesa's Integrations page, send a test SMS **to the same number
   you're using in the simulator**. It arrives in the simulator's inbox.
4. **Proof:** refresh the Integrations page. The USSD session and your test
   message both appear, and the message status moves to **DELIVERED** when the
   delivery report comes back.

---

## Stage 4 — Live SMS to real phones

Only do this once stage 3 works — the code is identical; only the account changes.

1. In Africa's Talking, go back to the main dashboard and **create a live app**
   (not the sandbox). Note its **username** — it's the app's username, not your
   email.
2. Generate an API key for the live app.
3. **Top up** the account. KES 500 is several hundred messages at ~KES 0.80 each.
4. In Vercel, change:

   | Name | New value |
   |---|---|
   | `AT_USERNAME` | your **live** app username |
   | `AT_API_KEY` | the **live** app's key |

5. In the **live** app, register the same two SMS callback URLs as in 3c.
6. Redeploy. Integrations should now say **Live**.

### ✅ Check stage 4

Integrations → **Send a live test** to **your own phone**. It arrives within a
few seconds from a shared Africa's Talking number. Refresh — status goes to
**DELIVERED**.

**If it fails, the error says why:** "Insufficient balance — top up", "Invalid
sender ID", "Invalid phone number", or "rejected the API key". Each is fixed on
the Africa's Talking side; no code change is ever needed.

**Demo riders are never texted.** The 240 synthetic riders have generated
numbers, and some of those will belong to real people. The platform flags every
synthetic rider and *always* simulates messages to them — even on a live
account. So a campaign to the whole register sends real SMS only to real riders
and simulates the rest. The composer shows the split and costs only the real
messages before you press send:

> 227 riders will receive this campaign — **Real messages 2** · Simulated (demo riders) 225 — Estimated cost KSh 1.60

For the live demo, register your own and your teammates' numbers as riders (with
their consent) through **Riders → Register a rider**. Those are real riders and
will receive real messages. Test sends from the Integrations page are capped at
20 per hour to protect your balance.

**Optional — branded sender ID.** Messages arrive from "BODAPESA" instead of a
number. One-off KES 8,700 and may require a registered business. Once approved,
set `AT_SENDER_ID=BODAPESA` and redeploy. Not needed for the project.

**What about the USSD short code?** A dedicated Safaricom code costs KES 145,000
set-up plus KES 70,000 a month. The sandbox channel proves the integration; a
live code is a commercial step outside the project scope. That's a strong,
defensible position — say it exactly like that.

---

## Stage 5 — WhatsApp Cloud API

At demo scale this needs no business verification — an unverified account can
reach up to 250 people a day.

### 5a. Create the app

1. Go to <https://developers.facebook.com> and log in with Facebook.
2. **My Apps → Create App →** choose the **Business** type.
3. Select or create a **business portfolio** (required).
4. Add the **WhatsApp** product to the app.
5. Under **WhatsApp → API Setup**, Meta gives you a **test phone number** and a
   **temporary access token**. Copy the **Phone number ID** (a long number, *not*
   the phone number itself).
6. In the **To** field, add and verify your own WhatsApp number. The test number
   can only message numbers you verify here.

### 5b. Get a permanent token

**The temporary token expires after about 24 hours.** If you use it, WhatsApp
will stop working the day after you set it up — possibly the morning of your
defence.

1. **Business Settings → Users → System users → Add** (role: Admin).
2. **Assign assets**: give it your app and your WhatsApp account with full control.
3. **Generate token**, choose your app, and tick
   `whatsapp_business_messaging`, `whatsapp_business_management` and
   `business_management`. Set expiry to **Never**.
4. Copy the token.

### 5c. Create the message template

Messages that BodaPesa *starts* (campaigns) must use a pre-approved template.
Replies inside 24 hours of a rider messaging you can be free text — the platform
chooses automatically.

**WhatsApp Manager → Message templates → Create template:**

| Field | Value |
|---|---|
| Category | **Marketing** (these messages promote products — labelling them "Utility" is the most common reason templates are rejected) |
| Name | `bodapesa_update` |
| Languages | **English** and **Swahili** — add both |
| Body | `BodaPesa: {{1}} Reply STOP to opt out.` |
| Sample for `{{1}}` | `Save KSh 100 before fuel and lunch. That is KSh 36,000 a year.` |

Meta rejects templates that start or end with a variable — which is why the body
has fixed text on both sides. BodaPesa strips its own "BodaPesa:" prefix and
opt-out line before filling `{{1}}`, so riders never see them twice. Sheng
messages are sent under the Swahili template.

Approval usually takes minutes, sometimes up to a day. **Submit this early.**

### 5d. Tell BodaPesa

In Vercel add:

| Name | Value |
|---|---|
| `WHATSAPP_TOKEN` | the permanent token from 5b |
| `WHATSAPP_PHONE_ID` | the Phone number ID from 5a |
| `WHATSAPP_TEMPLATE_NAME` | `bodapesa_update` |
| `WHATSAPP_VERIFY_TOKEN` | any word you choose, e.g. `bodapesa-verify` |

Redeploy.

### 5e. Register the webhook

1. In the Meta app: **WhatsApp → Configuration → Webhook → Edit**.
2. **Callback URL**: the WhatsApp webhook URL from BodaPesa's Integrations page.
3. **Verify token**: the same word you set as `WHATSAPP_VERIFY_TOKEN`.
4. Click **Verify and save**, then **subscribe to the `messages` field**.

### ✅ Check stage 5

1. Integrations → **Send a live test** → channel **WhatsApp** → your verified number.
2. It arrives on WhatsApp. Refresh Integrations — status moves to **DELIVERED**,
   then **READ** once you open it.
3. Reply to the message from your phone. It appears under **Inbound messages**.

**If it fails, the error says why:** "not on the allowed test list" (verify the
number in 5a), "Template not found" (wait for approval or check the name),
"token expired" (use the permanent token from 5b), or "Outside the 24-hour
window" (the template isn't approved yet).

---

## Before your defence — checklist

- [ ] `/api/health` shows `"ok": true` and `"database": "postgres"`
- [ ] You can sign in with your real admin password, not the demo one
- [ ] Integrations shows SMS as **Live** (or **Provider sandbox** if you stopped at stage 3)
- [ ] A test SMS to your phone arrives and shows **DELIVERED**
- [ ] The USSD menu works on the Africa's Talking simulator
- [ ] If using WhatsApp: the template is **approved** and you're using the **permanent** token
- [ ] Your own and teammates' numbers are registered as riders with consent, so a
      live campaign reaches real phones you can hold up
- [ ] You've practised the demo once end to end on the deployed URL, not localhost

### A suggested live demo (about 8 minutes)

1. **The problem, in one screen.** Open the dashboard — the funnel and inclusion
   indicators tell the story.
2. **Onboarding a rider in the field.** As admin, **Riders → Register rider**
   with a teammate's real number and consent ticked. **Their phone buzzes with
   the welcome SMS** while the examiners watch.
3. **The rider on a smartphone.** The teammate opens the site on their phone,
   enters their number, receives a **sign-in code by SMS**, and is in — lessons,
   quiz, literacy score going up.
4. **The rider on a feature phone.** Dial `*384*7788#` on the Africa's Talking
   simulator: agree to the consent screen, take a lesson, request a Britam product.
5. **The institution sees it.** Sign in as Britam in a second browser — both
   leads are in their pipeline, and they cannot see Stima's.
6. **Mass messaging, live.** Compose a campaign to "riders not yet insured".
   The composer shows real vs demonstration recipients and costs only the real
   ones. Send it. **Hold up the phones as it arrives.**
7. **Proof of delivery.** Refresh the campaign — delivery confirmed by the network.
8. **Close on the limits, honestly.** Live USSD short code (KES 145k + 70k/month),
   partner CRM integration, and a real-rider pilot are next steps, not gaps.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `/api/health` returns 503 | `DATABASE_URL` missing or wrong — check the Storage connection |
| Every page errors after deploy; logs say `SESSION_SECRET must be set` | Add `SESSION_SECRET` (and `ADMIN_PASSWORD`) and redeploy |
| Can't sign in as admin | `ADMIN_EMAIL` / `ADMIN_PASSWORD` in Vercel differ from what you used with `npm run db:reset` — run it again with matching values |
| No Stima/Britam login | `STIMA_PASSWORD` / `BRITAM_PASSWORD` weren't set when the database was seeded — set them and run `npm run db:reset` again |
| Africa's Talking callbacks do nothing | URL pasted without the `?secret=` part — copy it again from Integrations |
| Delivery status stuck on SENT | Delivery Reports callback not registered in the app you're actually sending from (sandbox vs live are separate) |
| Rider portal says SMS is not configured | `DEMO_MODE` is off and `AT_API_KEY` isn't set — finish stage 3 or 4, or sign in with a demonstration rider |
| Sign-in code never arrives on a real phone | You're on the sandbox — codes land in the Africa's Talking simulator. Real phones need stage 4 |
| Changed a variable, nothing happened | Vercel only applies environment variable changes on the **next deploy** — redeploy |
