import type { Metadata } from "next";
import Link from "next/link";
import { formatKes } from "@/components/ui";
import { getDonation, markFailed, settleCard } from "@/lib/payments/donations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you — BodaPesa", robots: { index: false } };

/**
 * Where Flutterwave sends a donor after the card page. The query string is
 * only used to find the donation — the outcome is confirmed with Flutterwave
 * server-to-server, never read from the URL.
 */
export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; tx_ref?: string; status?: string }>;
}) {
  const q = await searchParams;
  const ref = q.ref ?? q.tx_ref ?? "";

  let donation = /^BP-[A-Z0-9]{14}$/.test(ref) ? await getDonation(ref) : null;

  if (donation && donation.method === "CARD") {
    if (q.status === "cancelled" && donation.status === "PENDING") {
      await markFailed(donation.txRef, "The card payment was cancelled.", "CANCELLED");
    }
    donation = await settleCard((await getDonation(donation.txRef)) ?? donation);
  }

  const first = donation?.donorName?.split(" ")[0];

  let title = "We couldn’t find that donation";
  let body = "If you were charged, don’t worry — contact us with your payment receipt and we’ll sort it out.";
  let tone: "ok" | "wait" | "bad" = "bad";

  if (donation?.status === "SUCCESS") {
    tone = "ok";
    title = `Asante sana${first ? `, ${first}` : ""}!`;
    body = `Your ${formatKes(donation.amountKes)} gift has been received. You’re helping boda boda riders learn to save, borrow and insure wisely.`;
  } else if (donation?.status === "PENDING") {
    tone = "wait";
    title = "We’re confirming your payment";
    body = "This can take a minute. Refresh this page shortly — if your card was charged, your gift will be recorded automatically.";
  } else if (donation) {
    title = "The donation didn’t go through";
    body = donation.failureReason || "The payment was not completed, and you have not been charged.";
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="card p-8 max-w-md w-full text-center">
        <div
          className="w-12 h-12 mx-auto rounded-full grid place-items-center text-xl mb-4"
          style={{
            background: tone === "ok" ? "var(--brand-soft)" : tone === "wait" ? "var(--info-soft)" : "var(--danger-soft)",
            color: tone === "ok" ? "var(--brand-strong)" : tone === "wait" ? "var(--info)" : "var(--danger)",
          }}
        >
          {tone === "ok" ? "✓" : tone === "wait" ? "…" : "!"}
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{body}</p>
        {donation?.status === "SUCCESS" && donation.receipt ? (
          <p className="text-xs text-[var(--text-faint)] mt-3">Reference: {donation.txRef}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {tone === "bad" ? (
            <Link href="/donate" className="btn btn-primary">
              Try again
            </Link>
          ) : null}
          <Link href="/" className="btn btn-ghost">
            Back to BodaPesa
          </Link>
        </div>
      </div>
    </main>
  );
}
