import { NextResponse } from "next/server";
import { segmentSize, segmentRiders } from "@/lib/segments";
import type { Segment } from "@/lib/types";

/**
 * Live audience estimation for the campaign composer. The composer calls this
 * on every filter change so the number shown before sending is produced by the
 * same query that will select the recipients.
 */
export async function POST(request: Request) {
  const segment = (await request.json()) as Segment;
  const total = await segmentSize(segment);

  const riders = await segmentRiders(segment);
  const byLanguage: Record<string, number> = {};
  const byChannel: Record<string, number> = {};
  // Channel mix of recipients who will get a real message (synthetic
  // demonstration riders are always simulated), for an honest cost estimate.
  const realByChannel: Record<string, number> = {};
  let synthetic = 0;
  for (const r of riders) {
    if (Number(r.isSynthetic) === 1) synthetic++;
    else realByChannel[r.channelPref] = (realByChannel[r.channelPref] ?? 0) + 1;
    byLanguage[r.language] = (byLanguage[r.language] ?? 0) + 1;
    byChannel[r.channelPref] = (byChannel[r.channelPref] ?? 0) + 1;
  }

  return NextResponse.json({ total, synthetic, real: total - synthetic, byLanguage, byChannel, realByChannel });
}
