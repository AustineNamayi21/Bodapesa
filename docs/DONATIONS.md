# Donations — M-Pesa and card

The public page is **/donate**. Admin view: **/admin/donations** (platform admin only).

| Method | Provider | How it works |
| --- | --- | --- |
| M-Pesa | Safaricom Daraja — STK Push | Donor enters a phone number, gets a PIN prompt, Safaricom calls back with the result. If the callback is lost, the page asks Safaricom directly (STK Query). |
| Card | Paystack (preferred) or Flutterwave Standard (v3) | Donor is redirected to the provider's hosted page. We never touch card data. On return we verify the transaction server-to-server. If `PAYSTACK_SECRET_KEY` is set Paystack is used; otherwise `FLW_SECRET_KEY` (Flutterwave). |

Without credentials the whole flow is **simulated** (demo mode only). Simulated and sandbox
donations are listed in the admin view but **never counted** in the public "raised" total.
On a production site with no credentials the methods show "soon" and refuse requests.

---

## 1. M-Pesa (Daraja)

1. Create an app at <https://developer.safaricom.co.ke> → **My Apps**, enable **M-Pesa Express (STK Push)**.
2. Sandbox test — set in `.env` / Vercel:
   ```
   MPESA_ENV=sandbox
   MPESA_CONSUMER_KEY=...        MPESA_CONSUMER_SECRET=...
   MPESA_SHORTCODE=174379        MPESA_PASSKEY=<sandbox passkey from the portal>
   WEBHOOK_SECRET=<long random string>
   ```
3. Safaricom must reach your callback over **public HTTPS**. On Vercel that's automatic; locally use a
   tunnel (e.g. ngrok) and set `NEXT_PUBLIC_BASE_URL` to the tunnel URL.
4. **Going live** needs a real **Paybill or Till** in the organisation's name, then use *Go Live* in the
   Daraja portal. Set `MPESA_ENV=production` plus the production key, secret, shortcode and passkey.
   For a **Till**, also set `MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline` and `MPESA_PARTY_B=<till number>`.

## 2. Card (Paystack)

1. Create an account at <https://paystack.com/signup> (Kenya). Test mode works immediately, no paperwork.
2. In test mode go to **Settings → API Keys & Webhooks** and copy the **Test Secret Key** (`sk_test_…`) into
   `PAYSTACK_SECRET_KEY` in Vercel. Redeploy; `/api/health` should show `"card":"sandbox"`.
3. On the same page set the **Test Webhook URL** to `https://<your-site>/api/donate/paystack-webhook`.
   Paystack signs webhooks with your secret key, so there is no separate hash to configure.
4. Test cards are listed in Paystack's docs ("Test payments"). Never use a real card in test mode.
5. **Going live:** submit compliance documents on the Paystack dashboard (a Starter Business, for people who are
   not registered, or a Registered Business). Starter Businesses have a lifetime collection limit. Then swap in the
   live key (`sk_live_…`) and set the **Live Webhook URL** the same way.

Amounts are charged in KES; Paystack takes them in subunits (KES 500 is sent as 50000) — the code handles this.

### Alternative: Flutterwave

Set `FLW_SECRET_KEY` (`FLWSECK_TEST-…`) and `FLW_WEBHOOK_HASH` instead, and the webhook URL
`https://<your-site>/api/donate/flutterwave-webhook`. Leave `PAYSTACK_SECRET_KEY` unset.

## 3. Before you announce it

- Set `DONATION_ORG_NAME` — who donors are giving to (shown on the page and the card checkout).
- Edit `src/lib/payments/impact.ts` so the "what your gift does" lines match your **real** costs.
- Optional: `DONATION_GOAL_KES` shows a progress bar.
- Redeploy, then open `/api/health` — `payments` should show `live` for each method you enabled.
- Make one small real donation to yourself and confirm it appears as SUCCESS in `/admin/donations`.

## 4. Security notes

- The STK callback has no signature from Safaricom, so it is protected by `WEBHOOK_SECRET` in the URL and by
  the `CheckoutRequestID` (unknown to anyone but us and Safaricom). **Set `WEBHOOK_SECRET` in production.**
- Paystack webhooks are verified with an HMAC-SHA512 signature (`x-paystack-signature`); Flutterwave webhooks with
  `FLW_WEBHOOK_HASH`. Either way the payload is only a trigger: the transaction is re-verified with the provider
  (status, KES currency, amount ≥ expected) before crediting.
- Initiation is rate-limited per IP and per phone number so the endpoint can't be used to spam STK prompts.
  The limiter is in-memory (see `rateLimit` in `env.ts`) — fine for one instance, move to Redis/edge if you scale out.
- Public pages show first names only, never phone, email or receipt numbers; donors can opt out of the list.

## 5. Where things live

```
src/lib/payments/        config, mpesa.ts (Daraja), paystack.ts, flutterwave.ts, donations.ts (lifecycle), impact.ts
src/app/donate/          public page, form, /donate/thanks (card return)
src/app/api/donate/      mpesa, card, status, stk-callback, paystack-webhook, flutterwave-webhook
src/app/admin/donations/ admin list and totals
```
The `Donation` table is created automatically on first request (existing Postgres databases are topped up too).
